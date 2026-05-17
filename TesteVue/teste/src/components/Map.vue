<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map"></div>

    <div v-if="mapMessage" class="map-message">
      {{ mapMessage }}
    </div>

    <div ref="legend" class="map-legend">
      <table>
        <tr>
          <td><span class="legend-box" style="background:#FF4D4D"></span></td>
          <td>Casa/Apartamentos completos</td>
        </tr>
        <tr>
          <td><span class="legend-box" style="background:#2ECC71"></span></td>
          <td>Quarto privado</td>
        </tr>
        <tr>
          <td><span class="legend-box" style="background:#3498DB"></span></td>
          <td>Quarto partilhado</td>
        </tr>
        <tr>
          <td><span class="legend-box" style="background:#F1C40F"></span></td>
          <td>Quarto de hotel</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, toRaw } from 'vue'
import { useLocationsStore } from '@/stores/locations'
import { useStatisticsStore } from '@/stores/statistics'
import { useFilterStore } from '@/stores/filtros'

const locationsStore = useLocationsStore()
const statsStore = useStatisticsStore()
const filterStore = useFilterStore()

const map = ref(null)
const mapContainer = ref(null)
const legend = ref(null)
const markers = ref([])
const polygon = ref(null)
const infoWindow = ref(null)
const pinnedMarker = ref(null)
const mapMessage = ref('')

const requestId = ref(0)

const typeColors = {
  'completo': '#FF4D4D',
  'quarto_privado': '#2ECC71',
  'quarto_partilhado': '#3498DB',
  'quarto_hotel': '#F1C40F'
}

function createPolygonAround(center, d = 0.02) {
  return [
    { lat: center.lat + d, lng: center.lng - d },
    { lat: center.lat + d, lng: center.lng + d },
    { lat: center.lat - d, lng: center.lng + d },
    { lat: center.lat - d, lng: center.lng - d }
  ]
}

function closeInfoWindow() {
  if (infoWindow.value) {
    try { infoWindow.value.close() } catch (e) { }
    infoWindow.value = null
  }
  pinnedMarker.value = null
}

function showMapMessage(msg) {
  mapMessage.value = msg
}

function clearMapMessage() {
  mapMessage.value = ''
}

function clearOverlays() {
  markers.value.forEach(m => {
    try { m.setMap(null) } catch (e) { }
  })
  markers.value = []
  if (polygon.value) { try { polygon.value.setMap(null) } catch (e) { }; polygon.value = null }
  closeInfoWindow()
}

function setMarkers(listings = []) {
  if (!map.value || !window.google || !Array.isArray(listings)) return

  clearMapMessage()
  clearOverlays()

  const bounds = new window.google.maps.LatLngBounds()

  // Usar toRaw para performance se a lista for grande
  const rawListings = toRaw(listings)

  rawListings.forEach(item => {
    const lat = parseFloat(item.localizacao_latitude ?? item.latitude)
    const lng = parseFloat(item.localizacao_longitude ?? item.longitude)

    if (isNaN(lat) || isNaN(lng)) return

    const pos = { lat, lng }
    const color = typeColors[item.tipo] || '#888'

    const icon = {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: color,
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: '#ffffff'
    }

    const m = new window.google.maps.Marker({ position: pos, map: map.value, icon })

const content = `
  <div style="font-size:13px; line-height:1.5; color: #003366; min-width: 160px;">
    <div><strong>Host:</strong> ${item.nome_host || 'Desconhecido'}</div>
    <div><strong>Tipo:</strong> ${humanType(item.tipo)}</div>
    <div><strong>Preço:</strong> € ${item.preco}</div>
    
    <div><strong>Duração:</strong> ${item.duracao || 0} dias</div>
    <div><strong>Data inicial:</strong> ${item.data_inicial || 'N/A'}</div>
    <div><strong>Data final:</strong> ${item.data_final || 'N/A'}</div>

    ${item.review ? `<div><strong>Classificação:</strong> ${item.review} ★</div>` : ''}
  </div>
`

    m.addListener('click', () => {
      if (!infoWindow.value) infoWindow.value = new window.google.maps.InfoWindow()
      pinnedMarker.value = m
      infoWindow.value.setContent(content)
      infoWindow.value.open({ anchor: m, map: map.value })
    })

    m.addListener('mouseover', () => {
      if (!infoWindow.value) infoWindow.value = new window.google.maps.InfoWindow()
      if (pinnedMarker.value === m) return
      infoWindow.value.setContent(content)
      infoWindow.value.open({ anchor: m, map: map.value })
    })

    m.addListener('mouseout', () => {
      if (pinnedMarker.value === m) return
      if (infoWindow.value) infoWindow.value.close()
    })

    markers.value.push(m)
    bounds.extend(pos)
  })

  // Ajustar zoom e centro baseados nos marcadores existentes
  if (markers.value.length === 1) {
    map.value.panTo(bounds.getCenter())
    map.value.setZoom(14)
  } else if (markers.value.length > 1) {
    map.value.fitBounds(bounds)
  }

  // Desenhar polígono se houver marcadores
  if (markers.value.length > 0) {
    const center = { lat: bounds.getCenter().lat(), lng: bounds.getCenter().lng() }
    polygon.value = new window.google.maps.Polygon({
      paths: createPolygonAround(center),
      strokeColor: '#FF0000',
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.15
    })
    polygon.value.setMap(map.value)
  }
}

function humanType(t) {
  if (!t) return 'Desconhecido'
  if (t === 'completo') return 'Casa/Apartamento completo'
  if (t === 'quarto_privado') return 'Quarto privado'
  if (t === 'quarto_partilhado') return 'Quarto partilhado'
  if (t === 'quarto_hotel') return 'Quarto de hotel'
  return t
}

async function ensureMapReady() {
  if (window.google && window.google.maps) return true
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(check)
        resolve(true)
      }
    }, 100)
  })
}

function initMapWithCenter(center) {
  map.value = new window.google.maps.Map(mapContainer.value, {
    center,
    zoom: 12,
    mapTypeId: 'roadmap',
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: window.google.maps.ControlPosition.RIGHT_TOP // Move o botão para baixo se a legenda estiver no topo
    },
    streetViewControl: false,
    disableDefaultUI: true, // Opcional: para um look mais limpo
    zoomControl: true
  })

  if (legend.value) {
    map.value.controls[window.google.maps.ControlPosition.LEFT_TOP].push(legend.value)
  }

  map.value.addListener('click', () => {
    pinnedMarker.value = null
    closeInfoWindow()
  })
}

async function reiniciarMapa() {
  await ensureMapReady()
  clearOverlays()

  // Limpar mensagem ao reiniciar
  clearMapMessage()

  if (mapContainer.value) {
    try { mapContainer.value.innerHTML = '' } catch (e) { }
  }

  map.value = null
  await nextTick()
  // Centro default (Lisboa) - Se não houver resultados, o mapa ficará aqui
  // Idealmente deverias usar Geocoding para centrar na cidade vazia, mas isso requer API Key extra
  const defaultCenter = { lat: 38.7223, lng: -9.1393 }
  initMapWithCenter(defaultCenter)
}

// --- FUNÇÃO CORRIGIDA ---
async function focusOnCityFromData(myReq) {
  const startedAt = (typeof myReq === 'number') ? myReq : requestId.value
  if (startedAt !== requestId.value) return

  const country = (locationsStore.country || '').toString().trim()
  const city = (locationsStore.city || '').toString().trim()

  if (!country || !city) {
    clearMapMessage()
    clearOverlays()
    return
  }

  // 1) Obter dados da Store (que já devem estar filtrados pelo fetchStatistics)
  const rawAll = statsStore.filteredRawData || []
  const raw = rawAll.filter(i =>
    (i.pais || '').toString().trim() === country &&
    (i.cidade || '').toString().trim() === city
  )

  // 2) Se houver dados filtrados, desenha-os
  if (raw && raw.length > 0) {
    if (startedAt !== requestId.value) return
    setMarkers(raw)
    return
  }

  // 3) Se não houver dados (lista vazia) e a request for válida:
  if (startedAt === requestId.value) {
    clearOverlays()
    showMapMessage('Não foram encontrados resultados para os filtros selecionados.')
  }
}

async function atualizarDados() {
  requestId.value += 1
  const myReq = requestId.value

  await reiniciarMapa()

  try {
    // Busca dados filtrados
    await statsStore.fetchStatistics(filterStore.selecionados, locationsStore)
  } catch (e) {
    console.error(e)
    if (myReq === requestId.value) {
      showMapMessage('Erro ao carregar dados.')
    }
    return
  }

  if (myReq === requestId.value) {
    await focusOnCityFromData(myReq)
  }
}

let debounceTimer = null
watch(() => filterStore.selecionados, async () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    await atualizarDados()
  }, 180)
}, { deep: true })

watch([() => locationsStore.country, () => locationsStore.city], async () => {
  await atualizarDados()
})

onMounted(async () => {
  await ensureMapReady()
  const defaultCenter = { lat: 38.7223, lng: -9.1393 }
  initMapWithCenter(defaultCenter)

  if (locationsStore.city && locationsStore.country) {
    await atualizarDados()
  } else {
    if (Object.keys(filterStore.selecionados || {}).length) {
      await statsStore.fetchStatistics(filterStore.selecionados, locationsStore)
    }
  }
})
</script>

<style scoped>
* {
  font-family: Sansation, Arial;
}

.map-wrapper {
  width: 100%;
  height: 91%;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
  border-radius: 5px;
}

.map-legend {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #ccc;
  padding: 8px 10px;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  margin: 10px;
  z-index: 1000;
  opacity: 0.8;
}

.map-legend table {
  border-collapse: collapse;
}

.map-legend td {
  padding: 3px 6px;
  font-size: 13px;
  color: #122;
}

.map-legend .legend-box {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  margin-right: 8px;
  border: 1px solid #ccc;
}

.map-message {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #003366;
  background: rgba(255, 255, 255, 0.85);
  z-index: 0;
  padding: 30px;
  border-radius: 6px;
  backdrop-filter: blur(2px);
}
</style>