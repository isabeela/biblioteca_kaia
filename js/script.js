const SUPABASE_URL =
  "https://rjrwdgbdeluiskmiojfi.supabase.co";

const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqcndkZ2JkZWx1aXNrbWlvamZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNzYyODQsImV4cCI6MjA5Njc1MjI4NH0.zT5JLfXnxOe95LrJ_kqanPu2HlTn8ZZLxUYQDlbrxfM";

const db =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

let todosVideos = [];

async function carregarVideos() {

  const { data, error } = await db
    .from("biblioteca")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  todosVideos = data;

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