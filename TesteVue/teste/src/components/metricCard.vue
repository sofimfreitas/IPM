<template>
    <section :class="blocoClass">
        <h2>{{ titulo }}</h2>
        <p v-if="valor" class="valor">{{ valor }}</p>
        <slot></slot>
    </section>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
    titulo: {
        type: String,
        required: true
    },
    valor: {
        type: [String, Number],
        default: null
    },
    blocoClass: {
        type: String,
        required: true
    }
});
</script>

<style scoped>

section {
    background-color: rgb(185, 208, 250);
    border: 1px solid blue;
    padding: 10px;
    border-radius: 5px;
    text-align: center;
    font-weight: bold;
}

h2 {
    font-size: 16px;
    font-family: 'Sansation', sans-serif;
}

.valor {
    font-family: 'Sansation', sans-serif;
    font-size: 20px;
    font-weight: bold;
    color: #00336e;
    margin-top: 20px;
}

@media (max-width:800px) {
    .valor{
        font-size: 28px;
    }
}

@media (min-width: 801px)and (max-width: 1200px) {
    .valor{
        font-size: 28px;
    }
}

</style>