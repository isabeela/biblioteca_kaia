const SUPABASE_URL =
  "https://rjrwdgbdeluiskmiojfi.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  // ===========================
// MODAL TAGS
// ===========================

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

    const span =
      document.createElement(
        "span"
      );

    span.className =
      "tag-item";

    span.style.background =
      tag.cor || "#666";

    span.style.color =
      "#fff";

    span.style.padding =
      "6px 12px";

    span.style.margin =
      "4px";

    span.style.borderRadius =
      "20px";

    span.style.display =
      "inline-block";

    span.innerHTML =
      `${tag.emoji || ""} ${tag.nome}`;

    lista.appendChild(
      span
    );

  });

}

// ===========================
// INICIALIZAÇÃO
// ===========================

carregarTags();