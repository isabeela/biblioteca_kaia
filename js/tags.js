// ==========================
// ELEMENTOS
// ==========================

const modal =
document.getElementById("tagModal");

const btnNovaTag =
document.getElementById("btnNovaTag");

const btnSalvarTag =
document.getElementById("saveTag");

const btnCancelarTag =
document.getElementById("cancelTag");

const btnEmoji =
document.getElementById("btnEmoji");

const emojiContainer =
document.getElementById("emojiContainer");

const picker =
document.querySelector("emoji-picker");

// ==========================
// ABRIR MODAL
// ==========================

btnNovaTag.addEventListener("click", () => {

    modal.classList.add("show");

});

// ==========================
// FECHAR MODAL
// ==========================

btnCancelarTag.addEventListener("click", () => {

    modal.classList.remove("show");

});

// ==========================
// ABRIR EMOJI PICKER
// ==========================

btnEmoji.addEventListener("click", () => {

    if (
        emojiContainer.style.display === "none" ||
        emojiContainer.style.display === ""
    ) {

        emojiContainer.style.display = "block";

    } else {

        emojiContainer.style.display = "none";

    }

});

// ==========================
// SELECIONAR EMOJI
// ==========================

picker.addEventListener(
    "emoji-click",
    (event) => {

        document
        .getElementById("tagEmoji")
        .value =
        event.detail.unicode;

        emojiContainer.style.display =
        "none";

    }
);

// ==========================
// BOTÃO SALVAR
// ==========================

btnSalvarTag.addEventListener(
    "click",
    salvarTag
);

// ==========================
// SALVAR TAG
// ==========================

async function salvarTag() {

    const nome =
    document
    .getElementById("novaTag")
    .value
    .trim();

    const cor =
    document
    .getElementById("tagColor")
    .value;

    const emoji =
    document
    .getElementById("tagEmoji")
    .value;

    if (!nome) {

        alert("Digite o nome da tag");

        return;

    }

    const { error } =
    await db
    .from("tags")
    .insert([
        {
            nome,
            cor,
            emoji
        }
    ]);

    if (error) {

        console.error(error);

        alert(
            "Erro ao salvar tag"
        );

        return;

    }

    alert(
        "Tag criada com sucesso!"
    );

    // limpa campos

    document.getElementById(
        "novaTag"
    ).value = "";

    document.getElementById(
        "tagEmoji"
    ).value = "";

    document.getElementById(
        "tagColor"
    ).value = "#3b82f6";

    modal.classList.remove("show");

    carregarTags();

}

// ==========================
// CARREGAR TAGS
// ==========================

async function carregarTags() {

    const { data, error } =
    await db
    .from("tags")
    .select("*")
    .order(
        "nome",
        {
            ascending: true
        }
    );

    if (error) {

        console.error(error);

        return;

    }

    const lista =
    document.getElementById(
        "listaTags"
    );

    lista.innerHTML = "";

    data.forEach(tag => {

        const div =
        document.createElement("div");

        div.className =
        "tag-item";

        div.style.background =
        tag.cor || "#666";

        div.style.color =
        "#fff";

        div.style.padding =
        "8px 12px";

        div.style.margin =
        "4px";

        div.style.borderRadius =
        "20px";

        div.style.display =
        "inline-block";

        div.innerHTML =
        `${tag.emoji || ""} ${tag.nome}`;

        lista.appendChild(div);

    });

}

// ==========================
// INICIALIZAÇÃO
// ==========================

carregarTags();