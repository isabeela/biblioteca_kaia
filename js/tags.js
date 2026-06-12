const modal =
  document.getElementById("tagModal");

const btnNovaTag =
  document.getElementById("btnNovaTag");

const btnSalvarTag =
  document.getElementById("saveTag");

const btnCancelarTag =
  document.getElementById("cancelTag");

// abrir
btnNovaTag.addEventListener("click", () => {

  modal.classList.add("show");

});

// fechar
btnCancelarTag.addEventListener("click", () => {

  modal.classList.remove("show");

});

// salvar
btnSalvarTag.addEventListener(
  "click",
  salvarTag
);

// ===========================
// SALVAR TAG
// ===========================

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
      .value
      .trim();

  if (!nome) {

    alert("Digite o nome da tag");

    return;

  }

  const { error } = await db
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

// ===========================
// CARREGAR TAGS
// ===========================

async function carregarTags() {

  const { data, error } = await db
    .from("tags")
    .select("*")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  const lista =
    document.getElementById("listaTags");

  lista.innerHTML = "";

  data.forEach(tag => {

    const div =
      document.createElement("div");

    div.className = "tag-item";

    div.style.background =
      tag.cor || "#666";

    div.innerHTML =
      `${tag.emoji || ""} ${tag.nome}`;

    lista.appendChild(div);

  });

}
// ===========================
// INICIALIZAÇÃO
// ===========================

carregarTags();