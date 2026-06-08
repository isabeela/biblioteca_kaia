let todosVideos = [];
fetch(
    "https://opensheet.elk.sh/1TbeO6CjnHWwOm1hdwhVRFMIBGLPkdXpILSEA_9D2bSM/Videos"
)
.then(response => response.json())
.then(videos => {

    todosVideos = videos;

    renderizarVideos(videos);

})
.catch(error => {

    console.error(error);

});

function renderizarVideos(videos){

  const gallery =
    document.getElementById("gallery");

  gallery.innerHTML = "";

  videos.forEach(video => {

    const tags =
      video.tags
        ? video.tags.split(",")
        : [];

    const tagsHtml =
      tags.map(tag =>
        `<span>${tag.trim()}</span>`
      ).join("");

    gallery.innerHTML += `

      <div class="video-card">

        <div class="video-preview">
          <iframe
            src="${video.url}"
            width="100%"
            height="220"
            allow="autoplay">
          </iframe>
        </div>

        <div class="content">

          <h3>${video.nome}</h3>

          <div class="tags">
            ${tagsHtml}
          </div>

          <div class="tag-form">

            <input
              type="text"
              id="tags_${video.fileId}"
              value="${video.tags || ''}"
              placeholder="Digite as tags">

            <button
              onclick="salvarTagsVideo('${video.fileId}')">

              Salvar

            </button>

          </div>

        </div>

      </div>

    `;

  });

}

const observer = new IntersectionObserver((entries) => {

  entries.forEach(entry => {

    const iframe = entry.target;

    if (entry.isIntersecting) {

      if (!iframe.src) {
        iframe.src = iframe.dataset.src;
      }

    } else {

      iframe.src = "";

    }

  });

}, {
  rootMargin: "300px"
});

document.querySelectorAll(".video-frame").forEach(iframe => {
  observer.observe(iframe);
});

function startLoopIframe(id, timeMs) {
      const iframe = document.getElementById(id);
    
      setInterval(() => {
        const src = iframe.src;
        iframe.src = "";
        
        setTimeout(() => {
          iframe.src = src;
        }, 200);
      }, timeMs);
    }

document
.getElementById("search")
.addEventListener("input", function(){

    const termo =
      this.value.toLowerCase();

    const filtrados =
      todosVideos.filter(video => {

        return (
          video.nome.toLowerCase()
          .includes(termo)

          ||

          video.tags.toLowerCase()
          .includes(termo)
        );

      });

    renderizarVideos(filtrados);
});
