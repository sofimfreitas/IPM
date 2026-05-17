import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLocationsStore = defineStore('locations', () => {
  const country = ref('')
  const city = ref('')

  function setLocation(newCountry, newCity) {
    country.value = newCountry
    city.value = newCity
  }

  return { country, city, setLocation }
})