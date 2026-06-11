import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔑 COLOQUE SEUS DADOS AQUI
const supabaseUrl = "https://rjrwdgbdeluiskmiojfi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const supabase = createClient(supabaseUrl, supabaseKey);

// preview do vídeo
const videoInput = document.getElementById("video");
const preview = document.getElementById("preview");

videoInput.addEventListener("change", () => {
  const file = videoInput.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});


async function uploadVideo() {
  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const personagem = document.getElementById("personagem").value;
  const tags = document.getElementById("tags").value;
  const file = videoInput.files[0];

  const status = document.getElementById("status");

  if (!file) {
    status.innerText = "Selecione um vídeo.";
    return;
  }

  status.innerText = "Enviando...";

  // nome único do arquivo
  const fileName = `${Date.now()}-${file.name}`;

  // 1. Upload para Storage
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from("videos")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    status.innerText = "Erro no upload do vídeo.";
    return;
  }

  // 2. Pegar URL pública
  const { data: publicUrlData } = supabase
    .storage
    .from("videos")
    .getPublicUrl(fileName);

  const url = publicUrlData.publicUrl;

  // 3. Inserir no banco
  const { error: dbError } = await supabase
    .from("biblioteca")
    .insert([
      {
        nome,
        descricao,
        personagem,
        tags,
        url
      }
    ]);

  if (dbError) {
    console.error(dbError);
    status.innerText = "Erro ao salvar no banco.";
    return;
  }

  status.innerText = "Upload concluído com sucesso!";
}

document.getElementById("btnUpload").addEventListener("click", uploadVideo);