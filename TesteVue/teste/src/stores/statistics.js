import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStatisticsStore = defineStore('statistics', () => {
  const nrhosts = ref('N/A')
  const duracaobloco = ref('N/A')
  const ganhomedio = ref('N/A')
  const nrListagensHost = ref('N/A')
  const dataPicoSemana = ref('N/A')
  const percentagemCurta = ref('N/A')
  const topHosts = ref([])
  const statsPorAno = ref({})
  const precosPorAno = ref({})
  const percentCompleto = ref(0)
  const percentQuartoPrivado = ref(0)
  const percentQuartoPartilhado = ref(0)
  const percentQuartoHotel = ref(0)
  const filteredRawData = ref([])

  const calcularSemanaPico = (dados) => {
    if (!dados || dados.length === 0) return 'N/A'
    const contagemPorSemana = {}
    dados.forEach(estadia => {
      const d = new Date(estadia.data_inicial)
      if (isNaN(d)) return
      const dFim = new Date(d)
      dFim.setDate(d.getDate() + 7)
      const label = `${d.toLocaleDateString('pt-PT')} a ${dFim.toLocaleDateString('pt-PT')}`
      contagemPorSemana[label] = (contagemPorSemana[label] || 0) + 1
    })
    const chaves = Object.keys(contagemPorSemana)
    return chaves.length === 0 ? 'N/A' : chaves.reduce((a, b) => contagemPorSemana[a] >= contagemPorSemana[b] ? a : b)
  }

  const calcularTopHosts = (dados) => {
    if (!dados || dados.length === 0) return []
    const cont = dados.reduce((acc, i) => { 
      acc[i.nome_host] = (acc[i.nome_host] || 0) + 1
      return acc 
    }, {})
    return Object.entries(cont)
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }

  async function fetchStatistics(filters, locations) {
    const rawCountry = locations.country?.trim()
    const rawCity = locations.city?.trim()

    if (!rawCountry || !rawCity) return

    const countryKey = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase()
    const cityKey = rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase()

    try {
      const response = await fetch(`http://localhost:3000/countries`)
      const allCountries = await response.json()
      
      let cityData = allCountries[countryKey] ? allCountries[countryKey][cityKey] : null
      
      if (cityData && cityData.length > 0) {
        const f = filters

        const filteredData = cityData.filter(item => {
          if (f.tipos && f.tipos.length > 0 && !f.tipos.includes(item.tipo)) return false
          if (f.precoMin && item.preco < f.precoMin) return false
          if (f.precoMax && item.preco > f.precoMax) return false
          if (f.estrelasMin && item.review < f.estrelasMin) return false
          if (f.estrelasMax && item.review > f.estrelasMax) return false
          if (f.noitesExatas && item.duracao !== f.noitesExatas) return false
          if (f.noitesMin && item.duracao < f.noitesMin) return false
          if (f.noitesMax && item.duracao > f.noitesMax) return false

          if (f.dataInicio && f.dataFim) {
            const parseDate = (str) => {
              const [d, m, y] = str.split('-').map(Number)
              return new Date(y, m - 1, d)
            }
            const dInicio = parseDate(f.dataInicio)
            const dFim = parseDate(f.dataFim)
            const dItem = new Date(item.data_inicial)
            if (dItem < dInicio || dItem > dFim) return false
          }
          return true
        })

        if (filteredData.length > 0) {
          filteredRawData.value = filteredData
          const totalListagens = filteredData.length
          const uniqueHosts = [...new Set(filteredData.map(item => item.nome_host))]
          const totalDuracao = filteredData.reduce((acc, item) => acc + item.duracao, 0)
          const ganhoTotalCidade = filteredData.reduce((acc, item) => acc + (item.preco * item.duracao), 0)
          const estadiasCurtas = filteredData.filter(item => item.duracao <= 4).length

          const contagemAnos = {}
          const somaPrecosAno = {}

          let cCompleto = 0, cPrivado = 0, cPartilhado = 0, cHotel = 0

          filteredData.forEach(item => {
            const ano = item.data_inicial.split('-')[0]
            contagemAnos[ano] = (contagemAnos[ano] || 0) + 1
            somaPrecosAno[ano] = (somaPrecosAno[ano] || 0) + item.preco

            if (item.tipo === 'completo') cCompleto++
            else if (item.tipo === 'quarto_privado') cPrivado++
            else if (item.tipo === 'quarto_partilhado') cPartilhado++
            else if (item.tipo === 'quarto_hotel') cHotel++
          })

          const mediasAnuais = {}
          Object.keys(somaPrecosAno).forEach(ano => {
            mediasAnuais[ano] = Number((somaPrecosAno[ano] / contagemAnos[ano]).toFixed(2))
          })

          nrhosts.value = uniqueHosts.length
          duracaobloco.value = (totalDuracao / totalListagens).toFixed(1) + " dias"
          ganhomedio.value = (ganhoTotalCidade / uniqueHosts.length).toFixed(2) + "€"
          nrListagensHost.value = (totalListagens / uniqueHosts.length).toFixed(1)
          dataPicoSemana.value = calcularSemanaPico(filteredData)
          percentagemCurta.value = ((estadiasCurtas / totalListagens) * 100).toFixed(0) + "%"
          topHosts.value = calcularTopHosts(filteredData)
          statsPorAno.value = contagemAnos
          precosPorAno.value = mediasAnuais
          percentCompleto.value = Number(((cCompleto / totalListagens) * 100).toFixed(1))
          percentQuartoPrivado.value = Number(((cPrivado / totalListagens) * 100).toFixed(1))
          percentQuartoPartilhado.value = Number(((cPartilhado / totalListagens) * 100).toFixed(1))
          percentQuartoHotel.value = Number(((cHotel / totalListagens) * 100).toFixed(1))

        } else {
          resetStatistics()
        }
      } else {
        resetStatistics()
      }
    } catch (error) {
      console.error("Erro ao procurar dados:", error)
      resetStatistics()
    }
  }

  const exportToJSON = () => {
    if (filteredRawData.value.length === 0) {
      alert("Não existem dados filtrados para exportar.");
      return;
    }

    const dataStr = JSON.stringify(filteredRawData.value, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `export_estadias_${new Date().getTime()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  function resetStatistics() {
    nrhosts.value = 'N/A'
    duracaobloco.value = 'N/A'
    ganhomedio.value = 'N/A'
    nrListagensHost.value = 'N/A'
    dataPicoSemana.value = 'N/A'
    percentagemCurta.value = 'N/A'
    topHosts.value = []
    statsPorAno.value = {}
    precosPorAno.value = {}
    percentCompleto.value = 0
    percentQuartoPrivado.value = 0
    percentQuartoPartilhado.value = 0
    percentQuartoHotel.value = 0
    filteredRawData.value = []
  }

  return { 
    nrhosts, duracaobloco, ganhomedio, 
    nrListagensHost, dataPicoSemana, percentagemCurta, topHosts, statsPorAno, precosPorAno,
    percentCompleto, percentQuartoPrivado, percentQuartoPartilhado, percentQuartoHotel,
    fetchStatistics, resetStatistics,filteredRawData, exportToJSON 
  }
})