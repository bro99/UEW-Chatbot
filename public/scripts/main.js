import Modal from './modal.js'

const modal = Modal()

const modalTitle = document.querySelector('.modal h2')
const modalDescription = document.querySelector('.modal p')
const modalButton = document.querySelector('.modal button')

//Pegar todos os botoes que existe com a classe check
const checkButtons = document.querySelectorAll(".actions a.check")
checkButtons.forEach(button =>{
    //adicionar a escuta
    button.addEventListener("click", (event) => handClick(event, true))
})

// Quanto o botao delete é clicado abre a modal
const deleteButton = document.querySelectorAll(".actions a.delete")
deleteButton.forEach(button =>{
        //adicionar a escuta
        button.addEventListener("click", (event) => handClick(event, false))
})

function handClick(event, check=true){
    event.preventDefault()
    const text = check ? "Marcar como lida" : "Excluir"
    const slug = check ? "check" : "delete"

    const roomId = document.querySelector("#room-id").dataset.id

    const questonId = event.target.dataset.id

    const form = document.querySelector(".modal form")
    form.setAttribute("action", `/question/${roomId}/${questonId}/${slug}`)
    
    modalTitle.innerHTML = `${text} esta pergunta`
    modalDescription.innerHTML = `Tem certeza que deseja ${text.toLocaleLowerCase()} pergunta?`
    modalButton.innerHTML = `Sim, ${text.toLocaleLowerCase()}`
    check ? modalButton.classList.remove("red") : modalButton.classList.add("red")
    //Abrir modal
    modal.open();
}