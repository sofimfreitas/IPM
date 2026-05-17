import { useStatisticsStore } from '@/stores/statistics'

/**
 * Calcula estatísticas comparáveis para duas localizações.
 * @param {Object} options
 * @param {{country:string, city:string}} options.location1
 * @param {{country:string, city:string}} options.location2
 * @param {string[]} options.metricsLabels  // labels selecionados no UI
 * @param {Object} options.filters          // filtros ativos (tipos, datas, etc.)
 * @returns {Promise<Object>}               // dados prontos para gráficos
 */
export async function computeComparison({ location1, location2, metricsLabels, filters }) {
  const statisticsStore = useStatisticsStore()

  // 1) stats para cidade base
  await statisticsStore.fetchStatistics(filters, {
    country: location1.country,
    city: location1.city
  })
  const stats1 = snapshotStats(statisticsStore)

  // 2) stats para cidade a comparar
  await statisticsStore.fetchStatistics(filters, {
    country: location2.country,
    city: location2.city
  })
  const stats2 = snapshotStats(statisticsStore)

  const city1Label = `${location1.city}, ${location1.country}`
  const city2Label = `${location2.city}, ${location2.country}`

  const result = {}

  for (const label of metricsLabels) {
    switch (label) {

      // TOTAL DE LISTAGENS (somatório de todos os anos)
      case 'Número de listagens total': {
        const total1 = sumObjectValues(stats1.statsPorAno)
        const total2 = sumObjectValues(stats2.statsPorAno)
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          total1,
          total2,
          'listagens'
        )
        break
      }

      case 'Nr de hosts':
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          stats1.nrhostsNum,
          stats2.nrhostsNum,
          'hosts'
        )
        break

      case 'Ganho médio':
        // ganho médio por host
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          parseCurrency(stats1.ganhomedio),
          parseCurrency(stats2.ganhomedio),
          '€'
        )
        break

      case 'Nr de listagens médio por host':
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          stats1.nrListagensHostNum,
          stats2.nrListagensHostNum,
          'list/host'
        )
        break

      case 'Duração média das estadias':
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          parseNumber(stats1.duracaobloco),
          parseNumber(stats2.duracaobloco),
          'dias'
        )
        break

      case 'Estadias de curta duração':
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          parsePercent(stats1.percentagemCurta),
          parsePercent(stats2.percentagemCurta),
          '%'
        )
        break

      case 'Preço médio por noite': {
        // média global dos preços médios anuais
        const p1 = meanOfObjectValues(stats1.precosPorAno)
        const p2 = meanOfObjectValues(stats2.precosPorAno)
        result[label] = singleMetric(
          label,
          city1Label,
          city2Label,
          p1,
          p2,
          '€'
        )
        break
      }

      case 'Proporções de tipo de propriedade':
        result[label] = {
          title: label,
          city1Label,
          city2Label,
          type: 'property-types',
          labels: ['Casa/apto completo', 'Quarto privado', 'Quarto partilhado', 'Quarto hotel'],
          city1Values: [
            stats1.percentCompleto,
            stats1.percentQuartoPrivado,
            stats1.percentQuartoPartilhado,
            stats1.percentQuartoHotel
          ],
          city2Values: [
            stats2.percentCompleto,
            stats2.percentQuartoPrivado,
            stats2.percentQuartoPartilhado,
            stats2.percentQuartoHotel
          ],
          unit: '%'
        }
        break

      default:
        break
    }
  }

  return result
}

// ------- helpers -------

function snapshotStats(store) {
  return {
    nrhosts: store.nrhosts,
    nrhostsNum: numericOrZero(store.nrhosts),
    duracaobloco: store.duracaobloco,
    ganhomedio: store.ganhomedio,
    nrListagensHost: store.nrListagensHost,
    nrListagensHostNum: numericOrZero(store.nrListagensHost),
    dataPicoSemana: store.dataPicoSemana,
    percentagemCurta: store.percentagemCurta,
    topHosts: [...store.topHosts],
    statsPorAno: { ...store.statsPorAno },
    precosPorAno: { ...store.precosPorAno },
    percentCompleto: store.percentCompleto,
    percentQuartoPrivado: store.percentQuartoPrivado,
    percentQuartoPartilhado: store.percentQuartoPartilhado,
    percentQuartoHotel: store.percentQuartoHotel,
    totalListagens: store.filteredRawData.length
  }
}

function singleMetric(title, city1Label, city2Label, v1, v2, unit) {
  const n1 = Number.isFinite(v1) ? v1 : 0
  const n2 = Number.isFinite(v2) ? v2 : 0
  return {
    title,
    city1Label,
    city2Label,
    city1Value: n1,
    city2Value: n2,
    unit
  }
}

function numericOrZero(v) {
  const n = Number(String(v ?? '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function parseCurrency(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace(/[^\d,.-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function parsePercent(str) {
  if (!str || typeof str !== 'string') return 0
  const n = Number(str.replace('%', '').replace(',', '.'))
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

function sumObjectValues(obj) {
  const vals = Object.values(obj || {})
    .map(v => Number(v))
    .filter(v => Number.isFinite(v))
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0)
}