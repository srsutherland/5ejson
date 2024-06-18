const setLastLoaded = (json, json_type) => {
    // Store the last loaded character in localStorage
    localStorage.setItem("last_loaded", JSON.stringify(json))
    localStorage.setItem("last_loaded_type", json_type)
}

const getLastLoaded = () => {
    return {
        json: JSON.parse(localStorage.getItem("last_loaded")),
        type: localStorage.getItem("last_loaded_type")
    }
}

export { setLastLoaded, getLastLoaded }