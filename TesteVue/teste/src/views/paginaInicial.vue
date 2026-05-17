<template>
    <div>
        <Header></Header>

        <main class="altura">
            <div class="caixas">
                <div class="selpais">
                    <p class="texto">Selecione um País:</p>
                    <div class="dropdown-wrapper">
                        <input v-model="locationsStore.country" @click="toggleCountries" class="searchbar" type="text"
                            placeholder="Clique para selecionar" readonly>
                        <div v-if="showCountries" class="dropdown-list">
                            <div v-for="pais in listaPaises" :key="pais" @click="selecionarPais(pais)"
                                class="dropdown-item">
                                {{ pais }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="selcidade">
                    <p class="texto">Selecione uma Cidade:</p>
                    <div class="dropdown-wrapper">
                        <input v-model="locationsStore.city" @click="toggleCities" class="searchbar" type="text"
                            :placeholder="locationsStore.country ? 'Clique para selecionar' : 'Selecione primeiro o país'"
                            :disabled="!locationsStore.country" readonly>
                        <div v-if="showCities" class="dropdown-list">
                            <div v-for="cidade in listaCidades" :key="cidade" @click="selecionarCidade(cidade)"
                                class="dropdown-item">
                                {{ cidade }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="boxbotao">
                <router-link to="" class="aplicar" @click.prevent="applyFilters">
                    Aplicar
                </router-link>
            </div>
        </main>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Header from '@/components/Header.vue';
import { useRouter } from 'vue-router';
import { useLocationsStore } from '@/stores/locations';

const router = useRouter();
const locationsStore = useLocationsStore();

const dbData = ref({});
const showCountries = ref(false);
const showCities = ref(false);

onMounted(async () => {
    try {
        const response = await fetch('http://localhost:3000/countries');
        dbData.value = await response.json();
    } catch (error) {
        console.error("Erro:", error);
    }
});

const listaPaises = computed(() => Object.keys(dbData.value));

const listaCidades = computed(() => {
    return locationsStore.country && dbData.value[locationsStore.country]
        ? Object.keys(dbData.value[locationsStore.country])
        : [];
});

const toggleCountries = () => {
    showCountries.value = !showCountries.value;
    showCities.value = false;
};

const toggleCities = () => {
    showCities.value = !showCities.value;
    showCountries.value = false;
};

const selecionarPais = (pais) => {
    locationsStore.country = pais;
    locationsStore.city = '';
    showCountries.value = false;
};

const selecionarCidade = (cidade) => {
    locationsStore.city = cidade;
    showCities.value = false;
};

const applyFilters = () => {
    if (locationsStore.country && locationsStore.city) {
        router.push('/mainframe');
    } else {
        alert('Por favor, selecione o País e a Cidade.');
    }
};

window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrapper')) {
        showCountries.value = false;
        showCities.value = false;
    }
});
</script>

<style scoped>
.altura {
    padding-top: 80px;
    padding-bottom: 100px;
}

.caixas {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 70px;
}

.selpais,
.selcidade {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 50px 70px 100px 70px;
    width: 100%;
    max-width: 950px;
}

p.texto {
    color: white;
    font-size: 25px;
    font-weight: bold;
}

.searchbar {
    flex: 1;
    height: 46px;
    padding: 0 20px;
    border: 1px solid black;
    border-radius: 20px;
    background-color: rgb(185, 208, 250);
    font-size: 25px;
    max-width: 500px;
    cursor: pointer;
}

.searchbar:disabled {
    background-color: #888;
    cursor: not-allowed;
}

.dropdown-wrapper {
    position: relative;
    flex: 1;
    max-width: 500px;
}

.dropdown-list {
    position: absolute;
    top: 50px;
    left: 0;
    width: 100%;
    background: white;
    border-radius: 10px;
    border: 1px solid black;
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
}

.dropdown-item {
    padding: 10px 20px;
    cursor: pointer;
    color: black;
    font-size: 20px;
}

.dropdown-item:hover {
    background-color: #d1e1ff;
}

.selpais p {
    margin-right: 93px;
}

.selcidade p {
    margin-right: 50px;
}

.boxbotao {
    margin-top: 150px;
    display: flex;
    justify-content: center;
}

.aplicar {
    font-size: 25px;
    padding: 12px 40px;
    border-radius: 25px;
    background-color: white;
    text-decoration: none;
    color: black;
    border: 1px solid #000;
}

@media (max-width:800px) {

    .selpais,
    .selcidade {
        flex-direction: column;
        text-align: center;
    }

    .selpais p,
    .selcidade p {
        margin-right: 0;
        margin-bottom: 10px;
    }
}
</style>