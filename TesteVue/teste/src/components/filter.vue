<template>
  <div class="overlay" v-if="props.visible"></div>
  <div class="container-filtros" v-if="props.visible">
    <div class="linha-cabecalho">
      <div class="espaco-em-branco">
        <p>A</p>
      </div>
      <div>
        <p class="texto-cabecalho">Filtros</p>
      </div>
      <span class="cruz" @click="fecharModal">&times;</span>
    </div>

    <div class="filtros-selecionados">
      <p>Filtros selecionados:</p>

      <div class="lista-filtros">
        <span v-for="(filtro, index) in filtrosSelecionados" :key="index" class="tag-filtro">
          {{ filtro }}
          <span class="remover-tag" @click="removerFiltroEspecifico(filtro)">&times;</span>
        </span>

        <span v-if="!filtrosSelecionados.length" class="nenhum-filtro">
          Nenhum
        </span>
      </div>
    </div>

    <div class="localizacao-filtro">
      <p>Localização:</p>
      <div class="dropdown-wrapper">
        <input type="text" placeholder="País" class="input" v-model="pais" readonly @focus="abrirPaisMenu"
          @blur="fecharMenusComAtraso" />

        <div v-if="showPaisMenu" class="dropdown-menu">
          <div v-for="p in listaPaises" :key="p" :class="['dropdown-item', { 'item-selecionado': pais === p }]"
            @mousedown="selecionarPais(p)">
            {{ p }}
          </div>
        </div>

      </div>

      <div class="dropdown-wrapper">
        <input type="text" placeholder="Cidade" class="input" v-model="cidade" readonly :disabled="!pais"
          @focus="abrirCidadeMenu" @blur="fecharMenusComAtraso" />

        <div v-if="showCidadeMenu" class="dropdown-menu">
          <div v-for="c in cidadesFiltradas" :key="c" :class="['dropdown-item', { 'item-selecionado': cidade === c }]"
            @mousedown="selecionarCidade(c)">
            {{ c }}
          </div>
        </div>
      </div>
      <div class="ajuda-wrapper">
        <span class="botao-ajuda" @click="toggleAjuda('localizacao')">?</span>
        <div v-if="ajudaAtiva === 'localizacao'" class="balao-ajuda">
          {{ textosAjuda.localizacao }}
        </div>
      </div>
    </div>


    <div class="tipo-habitacao">
      <div class="titulo-tipo-habitacao">
        <p>Tipo de habitação:</p>
        <div class="ajuda-wrapper">
          <span class="botao-ajuda" @click="toggleAjuda('tipo')">?</span>
          <div v-if="ajudaAtiva === 'tipo'" class="balao-ajuda">
            {{ textosAjuda.tipo }}
          </div>
        </div>
      </div>


      <div class="opcoes-estadia">
        <label class="opcao">
          <input type="checkbox" id="checkbox-qualquer" :checked="checkboxQualquer" @change="alternarQualquer">
          Qualquer
        </label>

        <label class="opcao">
          <input type="checkbox" value="casa_apt" class="checkbox-outras" v-model="outrasOpcoes.casa_apt">
          Casa/ apartamento completo
        </label>
        <label class="opcao">
          <input type="checkbox" value="quarto_priv" class="checkbox-outras" v-model="outrasOpcoes.quarto_priv">
          Quarto privado
        </label>
        <label class="opcao">
          <input type="checkbox" value="quarto_partilhado" class="checkbox-outras"
            v-model="outrasOpcoes.quarto_partilhado">
          Quarto partilhado
        </label>
        <label class="opcao">
          <input type="checkbox" value="hotel" class="checkbox-outras" v-model="outrasOpcoes.hotel">
          Quarto de hotel
        </label>
      </div>
    </div>

    <div>
      <div class="data-filtro">

        <p class="data-titulo">Data:</p>
        <input type="text" placeholder="DD-MM-AAAA" class="input" v-model="dataInicio" @blur="validarDatas">
        <p class="data-ate">até</p>
        <input type="text" placeholder="DD-MM-AAAA" class="input" v-model="dataFim" @blur="validarDatas">
        <div class="ajuda-wrapper">
          <span class="botao-ajuda" @click="toggleAjuda('data')">?</span>
          <div v-if="ajudaAtiva === 'data'" class="balao-ajuda">
            {{ textosAjuda.data }}
          </div>
        </div>
      </div>

    </div>

    <div>
      <div class="preco-filtro">
        <p class="preco-titulo">Preço por noite:</p>
        <input type="text" id="precoMin" placeholder="Preço mínimo" class="input" v-model="precoMin"
          @blur="validarPrecos">
        <p class="data-ate">até</p>
        <input type="text" id="precoMax" placeholder="Preço máximo" class="input" v-model="precoMax"
          @blur="validarPrecos">
        <div class="ajuda-wrapper">
          <span class="botao-ajuda" @click="toggleAjuda('preco')">?</span>
          <div v-if="ajudaAtiva === 'preco'" class="balao-ajuda">
            {{ textosAjuda.preco }}
          </div>
        </div>
      </div>

    </div>

    <div class="duracao-container">
      <div class="duracao-estadia">

        <div class="duracao-filtro">Duração da estadia:</div>
        <div class="opcoes-duracao">
          <label class="opcao">
            <input type="checkbox" v-model="duracao.exata" @change="selecionarDuracao('exata')">
            Duração exata
          </label>
          <label class="opcao">
            <input type="checkbox" v-model="duracao.flexivel" @change="selecionarDuracao('flexivel')">
            Duração flexível
          </label>
          <div class="ajuda-wrapper">
            <span class="botao-ajuda" @click="toggleAjuda('duracao')">?</span>
            <div v-if="ajudaAtiva === 'duracao'" class="balao-ajuda">
              {{ textosAjuda.duracao }}
            </div>
          </div>
        </div>
      </div>

      <div class="duracao-if" v-if="duracao.exata || duracao.flexivel">
        <div v-if="duracao.exata" class="duracao-exata-box">
          <p>Número de noites (exato):</p>
          <input type="number" min="1" class="input" v-model.number="noitesExatas">
        </div>
        <div v-if="duracao.flexivel" class="duracao-flexivel-box">
          <div class="input-group">
            <p>Número mínimo de noites:</p>
            <input type="number" min="1" class="input" v-model.number="noitesMin">
          </div>
          <div class="input-group">
            <p>Número máximo de noites:</p>
            <input type="number" min="1" class="input" v-model.number="noitesMax">
          </div>
        </div>
      </div>
    </div>

    <div class="pontuacao-filtro">

      <p class="pontuacao-titulo">Pontuação:</p>
      <div class="estrelas-min">
        <span v-for="(_, i) in 5" :class="['estrela', { preenchida: i < estrelasMin }]"
          @click="clicarEstrelaMin(i)">☆</span>
      </div>
      <p class="pontuacao-ate">até</p>
      <div class="estrelas-max">
        <span v-for="(_, i) in 5" :class="['estrela', { preenchida: i < estrelasMax }]"
          @click="clicarEstrelaMax(i)">☆</span>
      </div>
      <button class="remover-estrelas" @click="limparEstrelas">&times;</button>
      <div class="ajuda-wrapper">
        <span class="botao-ajuda" @click="toggleAjuda('pontuacao')">?</span>
        <div v-if="ajudaAtiva === 'pontuacao'" class="balao-ajuda">
          {{ textosAjuda.pontuacao }}
        </div>
      </div>
    </div>

    <div class="botoes-finais">
      <button class="botao-limpar" @click="limparSelecoes">Limpar seleções</button>
      <button class="botao-filtrar" @click="executarFiltragem">Filtrar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted } from "vue"
import { useFilterStore } from '@/stores/filtros'
import { useLocationsStore } from '@/stores/locations'

const filterStore = useFilterStore()
const locationsStore = useLocationsStore()

const emit = defineEmits(['fechar', 'aplicarFiltros', 'limparFiltros'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

function fecharModal() {
  emit('fechar')
}

const pais = ref(locationsStore.country || "")
const cidade = ref(locationsStore.city || "")

const showPaisMenu = ref(false)
const showCidadeMenu = ref(false)

const ajudaAtiva = ref(null)

const textosAjuda = {
  localizacao: "Selecione o país e a cidade para restringir a análise a uma região específica.",
  tipo: "Escolha o tipo de alojamento: 'Completo' para o espaço todo, ou tipos de quartos específicos.",
  data: "Filtre as estadias que se iniciaram dentro do intervalo de datas selecionado.",
  preco: "Defina o custo mínimo e máximo que os hóspedes pagaram por cada noite.",
  duracao: "Filtre por estadias curtas ou longas, definindo o número exato ou um intervalo de noites.",
  pontuacao: "Filtre os alojamentos com base na média de estrelas deixada pelos hóspedes."
}

function toggleAjuda(id) {
  ajudaAtiva.value = ajudaAtiva.value === id ? null : id
}

const dbData = ref({})
const listaPaises = computed(() => Object.keys(dbData.value))

const cidadesFiltradas = computed(() => {
  return pais.value && dbData.value[pais.value] ? Object.keys(dbData.value[pais.value]) : []
})

async function fetchLocations() {
  try {
    const response = await fetch('http://localhost:3000/countries')
    dbData.value = await response.json()
  } catch (e) {
    console.error('Failed to fetch locations:', e)
  }
}

function abrirPaisMenu() {
  showPaisMenu.value = true
  fetchLocations()
}

function abrirCidadeMenu() {
  if (!pais.value) return
  showCidadeMenu.value = true
}

watch(
  () => [locationsStore.country, locationsStore.city],
  ([sCountry, sCity]) => {
    if (sCountry !== pais.value) pais.value = sCountry || ""
    if (sCity !== cidade.value) cidade.value = sCity || ""
  }
)

function selecionarPais(p) {
  pais.value = p
  cidade.value = "" // limpa cidade ao mudar país
  showPaisMenu.value = false
}

function selecionarCidade(c) {
  cidade.value = c
  showCidadeMenu.value = false
}

function fecharMenusComAtraso() {
  setTimeout(() => {
    showPaisMenu.value = false
    showCidadeMenu.value = false
  }, 150)
}

const checkboxQualquer = ref(false)
const outrasOpcoes = reactive({
  casa_apt: false,
  quarto_priv: false,
  quarto_partilhado: false,
  hotel: false
})

watch(outrasOpcoes, () => {
  checkboxQualquer.value = Object.values(outrasOpcoes).every(v => v === true)
}, { deep: true })

function alternarQualquer(event) {
  const isChecked = event.target.checked
  checkboxQualquer.value = isChecked
  Object.keys(outrasOpcoes).forEach(key => outrasOpcoes[key] = isChecked)
}

const dataInicio = ref("")
const dataFim = ref("")

function formatarData(input) {
  let v = (input || "").toString().replace(/\D/g, "")
  if (v.length > 8) v = v.slice(0, 8)
  if (v.length <= 2) return v
  if (v.length <= 4) return v.slice(0, 2) + "-" + v.slice(2)
  return v.slice(0, 2) + "-" + v.slice(2, 4) + "-" + v.slice(4)
}

watch(dataInicio, v => dataInicio.value = formatarData(v))
watch(dataFim, v => dataFim.value = formatarData(v))

function validarDatas() {
  const inicio = dataInicio.value
  const fim = dataFim.value
  if (inicio.length !== 10 && fim.length !== 10) return

  const hojeLimite = new Date(); hojeLimite.setHours(23, 59, 59, 999)

  const validarStringData = (dataStr) => {
    if (!dataStr || dataStr.length !== 10) return null
    const [dia, mes, ano] = dataStr.split("-").map(Number)
    const dataObj = new Date(ano, mes - 1, dia)
    const isValid = dataObj.getDate() === dia && dataObj.getMonth() === mes - 1 && dataObj.getFullYear() === ano
    return isValid ? dataObj : null
  }

  if (inicio.length === 10) {
    const objInicio = validarStringData(inicio)
    if (!objInicio) { alert("Data de início inválida (dia/mês inexistente)."); dataInicio.value = ""; return }
    if (objInicio > hojeLimite) { alert("A data de início não pode ser futura."); dataInicio.value = ""; return }
  }

  if (fim.length === 10) {
    const objFim = validarStringData(fim)
    if (!objFim) { alert("Data de fim inválida (dia/mês inexistente)."); dataFim.value = ""; return }
    if (objFim > hojeLimite) { alert("A data de fim não pode ser futura."); dataFim.value = ""; return }
  }

  if (inicio.length === 10 && fim.length === 10) {
    const d1 = validarStringData(inicio)
    const d2 = validarStringData(fim)
    if (d1 && d2 && d2 < d1) { alert("A data final deve ser igual ou posterior à data inicial."); dataFim.value = "" }
  }
}

const precoMin = ref("")
const precoMax = ref("")

function aplicarEuro(v) {
  const nums = (v || "").toString().replace(/\D/g, "")
  return nums ? "€ " + nums : ""
}

watch(precoMin, v => precoMin.value = aplicarEuro(v))
watch(precoMax, v => precoMax.value = aplicarEuro(v))

function validarPrecos() {
  const min = Number(precoMin.value.replace(/\D/g, ""))
  const max = Number(precoMax.value.replace(/\D/g, ""))
  if (min && max && max <= min) { alert("O preço máximo deve ser maior que o preço mínimo."); precoMax.value = ""; }
}

const duracao = reactive({ exata: false, flexivel: false })
const noitesExatas = ref(null)
const noitesMin = ref(null)
const noitesMax = ref(null)

function selecionarDuracao(tipo) {
  if (tipo === "exata") {
    if (duracao.exata) {
      duracao.flexivel = false
      noitesMin.value = null; noitesMax.value = null
    }
  } else if (tipo === "flexivel") {
    if (duracao.flexivel) {
      duracao.exata = false
      noitesExatas.value = null
    }
  }
}

const estrelasMin = ref(0)
const estrelasMax = ref(0)

function clicarEstrelaMin(index) {
  estrelasMin.value = (estrelasMin.value === index + 1) ? 0 : index + 1
  validarEstrelas()
}

function clicarEstrelaMax(index) {
  estrelasMax.value = (estrelasMax.value === index + 1) ? 0 : index + 1
  validarEstrelas()
}

function validarEstrelas() {
  if (estrelasMax.value && estrelasMax.value < estrelasMin.value) {
    alert("A pontuação MÁXIMA deve ser igual ou maior que a MÍNIMA.")
    estrelasMax.value = 0
  }
}

function limparEstrelas() {
  estrelasMin.value = 0
  estrelasMax.value = 0
}

const filtrosSelecionados = computed(() => {
  const filtros = []
  if (pais.value) filtros.push(pais.value)
  if (cidade.value) filtros.push(cidade.value)

  if (outrasOpcoes.casa_apt) filtros.push("Casa/apartamento completo")
  if (outrasOpcoes.quarto_priv) filtros.push("Quarto privado")
  if (outrasOpcoes.quarto_partilhado) filtros.push("Quarto partilhado")
  if (outrasOpcoes.hotel) filtros.push("Quarto de hotel")

  if (dataInicio.value) filtros.push(`Desde ${dataInicio.value}`)
  if (dataFim.value) filtros.push(`Até ${dataFim.value}`)

  if (precoMin.value) filtros.push(`Preço mín. ${precoMin.value}`)
  if (precoMax.value) filtros.push(`Preço máx. ${precoMax.value}`)

  if (duracao.exata && noitesExatas.value) filtros.push(`${noitesExatas.value} noites`)
  if (duracao.flexivel) {
    if (noitesMin.value) filtros.push(`Min ${noitesMin.value} noites`)
    if (noitesMax.value) filtros.push(`Max ${noitesMax.value} noites`)
  }

  if (estrelasMin.value) filtros.push(`⭐ ${estrelasMin.value}+`)
  if (estrelasMax.value) filtros.push(`⭐ até ${estrelasMax.value}`)

  return filtros
})

function salvarNoStore() {
  const tiposSelecionados = []
  if (outrasOpcoes.casa_apt) tiposSelecionados.push('completo')
  if (outrasOpcoes.quarto_priv) tiposSelecionados.push('quarto_privado')
  if (outrasOpcoes.quarto_partilhado) tiposSelecionados.push('quarto_partilhado')
  if (outrasOpcoes.hotel) tiposSelecionados.push('quarto_hotel')

  filterStore.setFiltros({
    tipos: tiposSelecionados,
    precoMin: precoMin.value ? Number(precoMin.value.toString().replace(/\D/g, "")) : null,
    precoMax: precoMax.value ? Number(precoMax.value.toString().replace(/\D/g, "")) : null,
    dataInicio: dataInicio.value,
    dataFim: dataFim.value,
    noitesExatas: noitesExatas.value,
    noitesMin: noitesMin.value,
    noitesMax: noitesMax.value,
    estrelasMin: estrelasMin.value,
    estrelasMax: estrelasMax.value
  })
}

function executarFiltragem() {
  if (!pais.value || !cidade.value) {
    alert("País e cidade são campos OBRIGATÓRIOS.")
    return
  }
  locationsStore.setLocation(pais.value, cidade.value)

  salvarNoStore()
  fecharModal()
}

function limparSelecoes() {
  pais.value = ""
  cidade.value = ""
  checkboxQualquer.value = false
  Object.keys(outrasOpcoes).forEach(k => outrasOpcoes[k] = false)
  dataInicio.value = ""
  dataFim.value = ""
  precoMin.value = ""
  precoMax.value = ""
  duracao.exata = false
  duracao.flexivel = false
  noitesExatas.value = null
  noitesMin.value = null
  noitesMax.value = null
  limparEstrelas()
  emit("limparFiltros")
}

function removerFiltroEspecifico(labelFiltro) {
  // País / Cidade
  if (labelFiltro === pais.value) {
    pais.value = ""
    cidade.value = ""
    locationsStore.setLocation("", "")
  } else if (labelFiltro === cidade.value) {
    cidade.value = ""
    locationsStore.setLocation(pais.value || "", "")
  }
  // Tipos
  else if (labelFiltro === "Casa/apartamento completo") outrasOpcoes.casa_apt = false
  else if (labelFiltro === "Quarto privado") outrasOpcoes.quarto_priv = false
  else if (labelFiltro === "Quarto partilhado") outrasOpcoes.quarto_partilhado = false
  else if (labelFiltro === "Quarto de hotel") outrasOpcoes.hotel = false
  // Datas
  else if (labelFiltro.startsWith("Desde")) dataInicio.value = ""
  else if (labelFiltro.startsWith("Até")) dataFim.value = ""
  // Preços
  else if (labelFiltro.startsWith("Preço mín.")) precoMin.value = ""
  else if (labelFiltro.startsWith("Preço máx.")) precoMax.value = ""
  // Duração
  else if (labelFiltro.includes("noites")) {
    if (!labelFiltro.includes("Min") && !labelFiltro.includes("Max")) {
      noitesExatas.value = null
      duracao.exata = false
    }
    if (labelFiltro.startsWith("Min")) noitesMin.value = null
    if (labelFiltro.startsWith("Max")) noitesMax.value = null
    if (!noitesMin.value && !noitesMax.value) duracao.flexivel = false
  }
  // Estrelas
  else if (labelFiltro.includes("⭐")) {
    if (labelFiltro.includes("+")) estrelasMin.value = 0
    else if (labelFiltro.includes("até")) estrelasMax.value = 0
  }

  salvarNoStore()
}

watch(() => props.visible, (aberto) => {
  if (aberto) {
    fetchLocations()

    pais.value = locationsStore.country || ""
    cidade.value = locationsStore.city || ""

    const s = filterStore.selecionados

    outrasOpcoes.casa_apt = s.tipos.includes('completo')
    outrasOpcoes.quarto_priv = s.tipos.includes('quarto_privado')
    outrasOpcoes.quarto_partilhado = s.tipos.includes('quarto_partilhado')
    outrasOpcoes.hotel = s.tipos.includes('quarto_hotel')

    dataInicio.value = s.dataInicio || ""
    dataFim.value = s.dataFim || ""
    precoMin.value = s.precoMin ? "€ " + s.precoMin : ""
    precoMax.value = s.precoMax ? "€ " + s.precoMax : ""

    if (s.noitesExatas) {
      duracao.exata = true
      duracao.flexivel = false
      noitesExatas.value = s.noitesExatas
    } else if (s.noitesMin || s.noitesMax) {
      duracao.flexivel = true
      duracao.exata = false
      noitesMin.value = s.noitesMin
      noitesMax.value = s.noitesMax
    } else {
      duracao.exata = false; duracao.flexivel = false
      noitesExatas.value = noitesMin.value = noitesMax.value = null
    }

    estrelasMin.value = s.estrelasMin || 0
    estrelasMax.value = s.estrelasMax || 0
  }
})
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
  z-index: 999;
}

.container-filtros {
  width: 80%;
  max-width: 1500px;
  position: fixed;
  max-height: 70vh;
  overflow-y: auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 20px;
  padding: 30px;
  z-index: 2000;
  margin-left: 20px;
  margin-right: 20px;
  font-size: 20px;
  background-color: #D3E7FC;
  color: #003366;
}

.linha-cabecalho {
  height: 70px;
  display: flex;
  flex-direction: row;
  font-size: clamp(24px, 8vw, 60px);
  padding: 12px 20px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #003366;
}

.espaco-em-branco {
  flex-shrink: 0;
  width: 50px;
  opacity: 0;
}

.texto-cabecalho {
  flex: 1;
  text-align: center;
}

.cruz {
  flex-shrink: 0;
  width: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cruz:hover {
  color: #F00;
  transform: scale(1.10);
}

.cruz:active {
  transform: scale(0.98);
}

.localizacao-filtro,
.duracao-filtro,
.pontuacao-filtro,
.preco-filtro,
.data-filtro,
.filtros-selecionados {
  height: 70px;
  padding: 12px 20px;
  font-size: clamp(16px, 4vw, 32px);
  display: flex;
  align-items: center;
}

.localizacao-filtro {
  gap: 20px;
  border-bottom: 1px solid #003366;
}

.filtros-selecionados {
  border-bottom: 1px solid #003366;
}

.tipo-habitacao {
  height: auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid #003366;
}

.titulo-tipo-habitacao {
  width: 100%;
    font-size: clamp(16px, 5vw, 32px);
    display: flex; 
    align-items: center; 
    gap: 10px;
    height: 70px;
}

.opcoes-estadia {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-between;
  padding-bottom: 20px;
}

.opcao {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: clamp(18px, 3.5vw, 24px);
}

.opcao input[type="checkbox"] {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #003366;
  border-radius: 4px;
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.opcao input[type="checkbox"]:checked {
  background-color: #003366;
}

.opcao input[type="checkbox"]:checked::before {
  content: '✓';
  color: #D3E7FC;
  font-size: 20px;
  line-height: 20px;
}

.data-filtro {
  border-bottom: 1px solid #003366;
  gap: 20px;
}

.input {
  height: 40px;
  padding: 0 15px;
  font-size: 16px;
  font-family: Sansation, Arial, Helvetica, sans-serif;
  border: 2px solid #003366;
  border-radius: 15px;
  background-color: #ffffff;
  color: #003366;
  text-align: center;
  width: 120px;
}

.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 2px solid #003366;
  border-radius: 10px;
  z-index: 10;
  max-height: 150px;
  overflow-y: auto;
  max-height: none;
  overflow: hidden;
}

.dropdown-item {
  padding: 10px;
  cursor: pointer;
  font-size: 16px;
  color: #003366;
  transition: transform 0.3s ease, background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #D3E7FC;
  transform: scale(1.05);
}

.item-selecionado {
  background-color: #003366;
  color: #D3E7FC;
}

.preco-filtro {
  border-bottom: 1px solid #003366;
  gap: 20px;
}

.duracao-estadia {
  height: auto;
  display: flex;
  gap: 10px;
  align-items: center;
}

.duracao-filtro {
  padding-left: 20px;
}

.opcoes-duracao {
  display: flex;
  align-items: center;
  gap: 20px;
}

.duracao-container {
  height: auto;
  border-bottom: 1px solid #003366;
}

.duracao-exata-box,
.duracao-flexivel-box {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  margin-left: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.pontuacao-filtro {
  border-bottom: 1px solid #003366;
  gap: 20px;
}

.estrela {
  font-size: 40px;
  cursor: pointer;
  color: #003366;
}

.estrela.preenchida {
  color: #F0A500;
}

.remover-estrelas {
  font-size: 32px;
  color: #003366;
  background: none;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

.remover-estrelas:hover {
  color: #F00;
  transform: scale(1.10);
}

.remover-estrelas:active {
  transform: scale(0.98);
}

.botoes-finais {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.botao-limpar,
.botao-filtrar {
  font-family: 'Sansation', sans-serif;
  height: 50px;
  padding: 0 30px;
  border-radius: 30px;
  cursor: pointer;
  font-size: clamp(16px, 4vw, 32px);
  transition: 0.3s;
}

.botao-limpar {
  background: #D3E7FC;
  color: #003366;
  border: 4px solid #003366;
}

.botao-filtrar {
  background: #003366;
  color: #D3E7FC;
  border: none;
}

.botao-filtrar:hover {
  background: #002244;
  scale: 105%;
}

.botao-filtrar:active {
  background: #001122;
  scale: 98%;
}

.botao-limpar:hover {
  background: #C0D6F9;
  scale: 105%;
}

.botao-limpar:active {
  background: #A8C4F5;
  scale: 98%;
}

.lista-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-left: 15px;
}

.tag-filtro {
  background-color: #003366;
  color: #D3E7FC;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remover-tag {
  cursor: pointer;
}

.input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ajuda-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
}

.botao-ajuda {
  width: 22px;
  height: 22px;
  background-color: #003366;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
  user-select: none;
}

.botao-ajuda:hover {
  transform: scale(1.1);
  background-color: #004488;
}

.balao-ajuda {
  position: absolute;
  top: 27px;
  left: 10%;
  width: 220px;
  background: #003366;
  color: #D3E7FC;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.4;
  z-index: 100;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.balao-ajuda::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 8px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid #003366;
}
</style>