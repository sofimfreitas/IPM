<template>
    <header id="header">
        <div class="header-left">
            <router-link to="/" class="btn-sair" @click="handleLogout">
                Sair
            </router-link>
            
            <router-link to="" class="btn-voltar" @click.prevent="handleBack">
                <img src="/icons/arrow-left.svg" alt="Voltar" class="icon-voltar"> 
            </router-link>
            <span class="titulo">InsideAirBnb</span>
        </div>
    </header>
</template>


<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();


const handleBack = () => {
    router.back();
};

const handleLogout = () => {
    localStorage.clear(); 
    sessionStorage.clear(); 
};
</script>

<style scoped>
#header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid white;
    color: white;
    font-size: 30px;
    padding: 0 50px;
    height: 80px;
    position:fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: #003366;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.btn-sair,
.btn-voltar {
    font-family: 'Sansation', sans-serif;
    background-color: white;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-sair {
    color: #00336e;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    display: inline-block;
}

.btn-voltar {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

.btn-voltar:hover,
.btn-sair:hover {
    background-color: #e0e0e0;
}

.icon-voltar {
    width: 20px;
    height: 20px;
}

.titulo {
    font-size: 30px;
    font-weight: bold;
}
</style>
