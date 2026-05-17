<template>
  <div class="overlay" v-if="props.visible" @click="fecharModal"></div>

  <div class="container-alertas" v-if="props.visible">
    <button class="close-btn" @click="fecharModal">✕</button>

    <h2>Selecione o tipo de anomalia:</h2>

    <form class="filters">
      <label class="filter-label">
        <input 
          type="checkbox" 
          v-model="filtrosSelecionados"
          value="ocupacao"
        >
        Taxa de ocupação
      </label>
      <label class="filter-label">
        <input 
          type="checkbox" 
          v-model="filtrosSelecionados"
          value="reservas"
        >
        Número de reservas
      </label>
      <label class="filter-label">
        <input
          type="checkbox"
          v-model="filtrosSelecionados"
          value="geograficas"
        />
        Geográficas
      </label>
    </form>

    <div class="alert-list">
      <div
        v-if="alertasFiltrados.length === 0"
        class="alert-box vazio"
      >
        Nenhum alerta para os filtros atuais.
      </div>

      <div
        v-for="alerta in alertasFiltrados"
        :key="alerta.texto"
        class="alert-box"
      >
        {{ alerta.texto }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStatisticsStore } from '@/stores/statistics'

const statsStore = useStatisticsStore()
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['fechar', 'update-count'])

const filtrosSelecionados = ref([])

function numericOrZero(v) {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
function parseCurrency(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
function parseNumber(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}
function meanOfObjectValues(obj) {
  const vals = Object.values(obj || {})
    .map(v => Number(v))
    .filter(v => Number.isFinite(v))
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}


const alertasCalculados = computed(() => {
  const list = []

  if (!statsStore.filteredRawData || statsStore.filteredRawData.length === 0) {
    list.push({
      categoria: 'ocupacao',
      texto: 'Poucos dados disponíveis para esta seleção – a análise pode estar incompleta.'
    })
    return list
  }

  const nrHosts = numericOrZero(statsStore.nrhosts)
  const nrListagensHost = numericOrZero(statsStore.nrListagensHost)
  const ganhoMedio = parseCurrency(statsStore.ganhomedio)
  const duracaoMedia = parseNumber(statsStore.duracaobloco)
  const precoMedioNoite = meanOfObjectValues(statsStore.precosPorAno)
  const totalListagens = statsStore.filteredRawData.length

  console.log('DEBUG ALERTAS', {
    nrhosts: statsStore.nrhosts,
    parsedHosts: nrHosts,
    nrListagensHost: statsStore.nrListagensHost,
    parsedNrList: nrListagensHost,
    ganhomedio: statsStore.ganhomedio,
    parsedGanho: ganhoMedio,
    duracaobloco: statsStore.duracaobloco,
    parsedDuracao: duracaoMedia,
    precosPorAno: statsStore.precosPorAno,
    precoMedioNoite,
    total: totalListagens,
  })

  // ---------- OCUPAÇÃO ----------
  // Concentração de alojamentos em poucos hosts 
  if (nrHosts > 0 && nrListagensHost >= 1.2) {
    list.push({
      categoria: 'ocupacao',
      texto: `Concentração de alojamentos em alguns anfitriões: em média ${nrListagensHost.toFixed(1)} listagens por host.`
    })
  } else if (nrHosts > 0) {
    list.push({
      categoria: 'ocupacao',
      texto: `Distribuição relativamente equilibrada de alojamentos pelos ${nrHosts.toFixed(0)} hosts identificados.`
    })
  }

  // Mercado de alta rotatividade: estadias curtas 
  if (duracaoMedia > 0 && duracaoMedia < 3) {
    list.push({
      categoria: 'ocupacao',
      texto: `Mercado de elevada rotatividade: estadias curtas com duração média de ${duracaoMedia.toFixed(1)} noites.`
    })
  } else if (duracaoMedia >= 3) {
    list.push({
      categoria: 'ocupacao',
      texto: `Estadias tendencialmente mais longas, com duração média de ${duracaoMedia.toFixed(1)} noites.`
    })
  }

  // ---------- RESERVAS ----------
  // Ganho médio por host elevado 
  if (ganhoMedio >= 700) {
    list.push({
      categoria: 'reservas',
      texto: `Ganho médio por host relativamente elevado: cerca de ${ganhoMedio.toFixed(0)}€ por anfitrião.`
    })
  } else if (ganhoMedio > 0) {
    list.push({
      categoria: 'reservas',
      texto: `Ganho médio por host moderado, na ordem dos ${ganhoMedio.toFixed(0)}€ por anfitrião.`
    })
  }

  // Volume de reservas (usa apenas o nº de listagens filtradas)
  if (totalListagens >= 8) {
    list.push({
      categoria: 'reservas',
      texto: `Volume considerável de reservas neste recorte: ${totalListagens} estadias encontradas.`
    })
  } else {
    list.push({
      categoria: 'reservas',
      texto: `Número reduzido de reservas: apenas ${totalListagens} estadias no intervalo selecionado.`
    })
  }

  // ---------- GEOGRÁFICAS ----------
  // Preço médio por noite 
  if (precoMedioNoite >= 90) {
    list.push({
      categoria: 'geograficas',
      texto: `Preço médio por noite relativamente elevado para o conjunto atual: cerca de ${precoMedioNoite.toFixed(0)}€ por noite.`
    })
  } else if (precoMedioNoite > 0) {
    list.push({
      categoria: 'geograficas',
      texto: `Preço médio por noite moderado, próximo de ${precoMedioNoite.toFixed(0)}€ por noite.`
    })
  }

  // Fallback – garantir pelo menos 1 alerta em alguma categoria
  if (!list.length) {
    list.push({
      categoria: 'ocupacao',
      texto: 'Padrões aparentemente estáveis, sem anomalias fortes detetadas, mas com características a monitorizar.'
    })
  }

  return list
})

// aplica os filtros das checkboxes
const alertasFiltrados = computed(() => {
  const base = alertasCalculados.value
  if (!base.length) return []
  if (!filtrosSelecionados.value.length) return base
  return base.filter(a => filtrosSelecionados.value.includes(a.categoria))
})

// emitir sempre que o número de alertas visíveis mudar
watch(
  () => alertasFiltrados.value.length,
  (novoValor) => {
    emit('update-count', novoValor)
  },
  { immediate: true }
)

function fecharModal() {
  emit('fechar')
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1999;
}

.container-alertas {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 850px;
  max-height: 80vh;
  overflow-y: auto;
  background: #c8d9ec;
  border-radius: 20px;
  padding: 30px;
  z-index: 2000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-family: 'Sansation', sans-serif;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  border: none;
  font-size: 24px;
  color: #003366;
  background: transparent;
  cursor: pointer;
}

h2 {
  color: #003366;
  text-align: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 25px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #003366;
  font-weight: bold;
  cursor: pointer;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-box {
  background: #f2aeae;
  border: 1px solid #d32f2f;
  border-radius: 8px;
  padding: 15px 20px;
  color: #581103;
}

.alert-box.vazio {
  background: #f4f4f4;
  border-color: #999;
  color: #333;
}
</style>

