import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 COLOQUE SEUS DADOS AQUI
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabase = createClient(supabaseUrl, supabaseKey);
// ELEMENTOS
const videoInput = document.getElementById("video");
const preview = document.querySelector(".preview-video");
const queue = document.getElementById("queue");
const status = document.getElementById("status");

//
// DRAG & DROP
//
const dropZone = document.getElementById("drop-zone");

// clicar na área
dropZone.addEventListener("click", () => {
    videoInput.click();
});

// arrastando sobre a área
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

// saiu da área
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

// soltou arquivos
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();

    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;

    if (!files.length) return;

    // coloca os arquivos no input
    const dataTransfer = new DataTransfer();

    Array.from(files).forEach(file => {
        dataTransfer.items.add(file);
    });

    videoInput.files = dataTransfer.files;

    // dispara o mesmo evento usado pelo botão escolher arquivos
    videoInput.dispatchEvent(
        new Event("change", { bubbles: true })
    );
});

// EXTRAI NOME LIMPO
function extrairNomeArquivo(nomeArquivo) {
  const semExtensao = nomeArquivo.replace(/.[^/.]+$/, "");
  return semExtensao.split("_anim")[0].trim();
}


let todasTags = [];
async function carregarTags() {

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("nome");

  if (error) {
    console.error(error);
    return;
  }

  todasTags = data;
}

carregarTags();


videoInput.addEventListener("change", (event) => {
  queue.innerHTML = "";

  const files = Array.from(event.target.files);

  if (!files.length) return;

  // LISTA
  files.forEach((file, index) => {
    const url = URL.createObjectURL(file);
    const nome = extrairNomeArquivo(file.name);

    const card = document.createElement("div");
    card.className = "video-item";

    const video = document.createElement("video");

    video.className = "preview-video";
    video.controls = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;

    video.src = url;
    video.style.display = "block";

    const title = document.createElement("p");
    title.textContent = nome;

    const selectTags = document.createElement("select");

    selectTags.multiple = true;
    selectTags.className = `tags-${index}`;

    todasTags.forEach(tag => {

      const option = document.createElement("option");

      // valor salvo no banco
      option.value = tag.nome;

      // informações extras para o TomSelect
      option.dataset.color = tag.cor;
      option.dataset.emoji = tag.emoji;

      // texto exibido
      option.textContent =
        `${tag.emoji || ""} ${tag.nome}`;

      selectTags.appendChild(option);

    });


    const desc = document.createElement("textarea");
    desc.placeholder = "Descrição";
    desc.className = `desc-${index}`;

    const btn = document.createElement("button");
    btn.textContent = "Enviar este vídeo";

    // 🔥 IMPORTANTE: capturar file direto (não index)
   btn.onclick = () =>
    uploadSingleFile(
      file,
      desc,
      index,
      card
    );

    card.appendChild(video);
    card.appendChild(title);
    card.appendChild(selectTags);
    card.appendChild(desc);
    card.appendChild(btn);

    queue.appendChild(card);
    new TomSelect(selectTags, {

  plugins: ["remove_button"],

  render: {

    item: function(data, escape) {
      const cor =
        data.$option.dataset.color || "#666";

          return `
            <div style="
              background:${cor};
              color:white;
              border-radius:20px;
              padding:4px 10px;
            ">
              ${escape(data.text)}
            </div>
          `;
        }

      }

    });
    
    });
});

//
// 🚀 UPLOAD TODOS
//
async function uploadVideo() {

  const files = Array.from(videoInput.files);

  if (!files.length) {
    status.innerText = "Selecione vídeos.";
    return;
  }

  status.innerText = `Enviando ${files.length} vídeos...`;

  for (let i = 0; i < files.length; i++) {

    const file = files[i];

    const tagsSelecionadas =
      Array.from(
        document.querySelector(`.tags-${i}`).selectedOptions
      )
      .map(option => option.value);

    const descricao =
      document.querySelector(`.desc-${i}`)?.value || "";

    const nome = extrairNomeArquivo(file.name);

    const fileName = `${Date.now()}-${file.name}`;

    // Upload Storage
    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(fileName, file);

    if (uploadError) {
      console.error(uploadError);
      continue;
    }

    // URL pública
    const { data } = supabase.storage
      .from("videos")
      .getPublicUrl(fileName);

    const url = data.publicUrl;

    // Banco
    const { error: dbError } = await supabase
      .from("biblioteca")
      .insert([
        {
          nome,
          descricao,
          tags: tagsSelecionadas.join(","),
          personagem: "",
          url
        }
      ]);

    if (dbError) {
      console.error(dbError);
    }
  }

  alert("Vídeos enviados!");

  setTimeout(() => {
    location.reload();
  }, 1500);
}

//
// 🎯 UPLOAD INDIVIDUAL
//
async function uploadSingleFile(file, descEl, index, card) {

const selectTags =
document.querySelector(`.tags-${index}`);

const tags =
Array.from(selectTags.selectedOptions)
.map(option => option.value)
.join(",");

const descricao = descEl.value;

  const nome = extrairNomeArquivo(file.name);
  const fileName = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("videos")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage
    .from("videos")
    .getPublicUrl(fileName);

  const url = data.publicUrl;

  const { error: dbError } = await supabase
    .from("biblioteca")
    .insert([
      {
        nome,
        tags,
        descricao,
        url
      }
    ]);

  if (dbError) {
    console.error(dbError);
    return;
  }

  alert("Vídeo enviado com sucesso")

  card.style.opacity = "0";

  setTimeout(() => {
    card.remove();
  }, 300);
  }

//
// BOTÃO
//
document
  .getElementById("btnUpload")
  .addEventListener("click", uploadVideo);