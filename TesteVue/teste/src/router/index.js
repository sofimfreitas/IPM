import { createRouter, createWebHistory } from 'vue-router'
import Mainframe from '../views/mainframe.vue'
import PaginaInicial from '../views/paginaInicial.vue'
import comparacaoGraficos from '@/views/comparacaoGraficos.vue'
import Filtros from '../components/filter.vue'
import Criacao_Graficos from '../views/criacao_graficos.vue'
import GraficosDash from '../views/graficos.vue'
import Alertas from '../views/alertas.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'initial',
      component: PaginaInicial,
    },
    {
      path: '/mainframe',
      name: 'mainframe',
      component: Mainframe,
    }, 
    {
      path: '/compare',
      name: 'compare',
      component: comparacaoGraficos,
    },
    {
      path: '/filtros',
      name: 'filtros',
      component: Filtros,
    },
    {
      path: '/criacao_graficos',
      name: 'criacao_graficos',
      component: Criacao_Graficos,
    },
    {
      path: '/graficos_dash',
      name: 'graficos_dash',
      component: GraficosDash,
    },
    {
      path: '/alertas',
      name: 'alertas',
      component: Alertas,
    }
  ],
})

export default router