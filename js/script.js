const SUPABASE_URL =
  "https://rjrwdgbdeluiskmiojfi.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


const modal =
  document.getElementById("tagModal");

document
  .getElementById("btnNovaTag")
  .addEventListener("click", () => {

    modal.classList.add("show");

});

document
  .getElementById("cancelTag")
  .addEventListener("click", () => {

    modal.classList.remove("show");

});

document
  .getElementById("saveTag")
  .addEventListener("click", async () => {

    const nome =
      document.getElementById("novaTag")
      .value
      .trim();

    if (!nome) return;

    const { error } = await supabase
      .from("tags")
      .insert([
        { nome }
      ]);

    if (error) {
      console.error(error);
      return;
    }

    alert("Tag criada!");

    modal.classList.remove("show");

    document.getElementById("novaTag").value = "";

    carregarTags();

});


const modal = document.getElementById("tagModal");

// ABRIR POPUP
document
  .getElementById("btnNovaTag")
  .addEventListener("click", () => {

    modal.classList.add("show");

});

// FECHAR POPUP
document
  .getElementById("cancelTag")
  .addEventListener("click", () => {

    modal.classList.remove("show");

});

// SALVAR TAG
document
  .getElementById("saveTag")
  .addEventListener("click", salvarTag);

async function salvarTag() {

  const nome = document
    .getElementById("novaTag")
    .value
    .trim();

  const cor = document
    .getElementById("tagColor")
    .value;

  const emoji = document
    .getElementById("tagEmoji")
    .value
    .trim();

  if (!nome) {

    alert("Digite o nome da tag");

    return;

  }

  const { error } = await supabase
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

    alert("Erro ao salvar tag");

    return;

  }

  alert("Tag criada com sucesso!");

  // limpa os campos
  document.getElementById("novaTag").value = "";
  document.getElementById("tagEmoji").value = "";
  document.getElementById("tagColor").value = "#3b82f6";

  // fecha popup
  modal.classList.remove("show");

  // atualiza lista de tags
  carregarTags();

}

async function carregarTags() {

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("nome");

  if (error) {

    console.error(error);

    return;

  }

  console.log(data);

}

let todosVideos = [];

// async function carregarVideos() {

//   const { data, error } = await db
//     .from("biblioteca")
//     .select("*")
//     .order("id", { ascending: false });

//   if (error) {
//     console.error(error);
//     return;
//   }

//   todosVideos = data;

//   renderizarVideos(data);

// }

async function carregarVideos() {

  const { data, error } = await db
    .from("biblioteca")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error) return;

  renderizarVideos(data);
}

function renderizarVideos(videos) {

  const gallery =
    document.getElementById("gallery");

  gallery.innerHTML = "";

  videos.forEach(video => {

    const tags = video.tags
      ? video.tags.split(",")
      : [];

    const tagsHtml = tags
      .map(tag =>
        `<span class="tag">${tag.trim()}</span>`
      )
      .join("");

    gallery.innerHTML += `

      <div class="video-card">

        <div class="video-preview">

          <video
            autoplay
            muted
            loop
            playsinline
            preload="metadata">

            <source
              src="${video.url}"
              type="video/mp4">

          </video>

        </div>

        <div class="content">

          <h3>${video.nome || ""}</h3>

          <div class="tags">
            ${tagsHtml}
          </div>

        </div>

      </div>

    `;

  });

}

carregarVideos();