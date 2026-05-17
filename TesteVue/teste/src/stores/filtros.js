import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useFilterStore = defineStore('filters', () => {
  const selecionados = reactive({
    tipos: [],
    precoMin: null,
    precoMax: null,
    dataInicio: '',
    dataFim: '',
    noitesExatas: null,
    noitesMin: null,
    noitesMax: null,
    estrelasMin: 0,
    estrelasMax: 0
  })

  function setFiltros(novosFiltros) {
    Object.assign(selecionados, novosFiltros)
  }

  function resetFiltros() {
    selecionados.tipos = []
    selecionados.precoMin = null
    selecionados.precoMax = null
    selecionados.dataInicio = ''
    selecionados.dataFim = ''
    selecionados.noitesExatas = null
    selecionados.noitesMin = null
    selecionados.noitesMax = null
    selecionados.estrelasMin = 0
    selecionados.estrelasMax = 0
  }

  return { selecionados, setFiltros, resetFiltros }
})