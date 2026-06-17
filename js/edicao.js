
// =====================================
// CARREGAR TODAS AS TAGS NO SELECT
// =====================================

async function carregarTagsModal(tagsAtuais = []){

    const { data: tags, error } = await db
        .from("tags")
        .select("*")
        .order("nome");

    if(error){

        console.log(error);

        return;
    }

    const select =
        document.getElementById("selectTagsVideo");

    select.innerHTML = "";

    tags.forEach(tag => {

        const option =
            document.createElement("option");

        option.value = tag.nome;

        option.textContent =
            `${tag.emoji || ""} ${tag.nome}`;

        select.appendChild(option);

    });


    // Destroi TomSelect anterior

    if(tomTagsVideo){

        tomTagsVideo.destroy();

    }


    tomTagsVideo = new TomSelect(
        "#selectTagsVideo",
        {

            plugins:["remove_button"],

            create:false,

            persist:false

        }
    );


    // Marca as tags já existentes

    tomTagsVideo.setValue(tagsAtuais);

}



// =====================================
// SALVAR TAGS
// =====================================

async function salvarTagsVideo(){

    if(!videoSelecionado){

        alert("Nenhum vídeo selecionado");
        return;

    }

    const tagsSelecionadas =
        tomTagsVideo.getValue();

    console.log("Tags:", tagsSelecionadas);

    const tagsString =
        Array.isArray(tagsSelecionadas)
        ? tagsSelecionadas.join(",")
        : tagsSelecionadas;

    console.log("Salvar:", tagsString);

    const { data, error } = await db
        .from("biblioteca")
        .update({

            tags: tagsString

        })
        .eq("id", videoSelecionado)
        .select();

    console.log("DATA:", data);
    console.log("ERROR:", error);

    if(error){

        alert("Erro ao salvar");
        return;

    }

    alert("Salvo com sucesso");
    fecharModalTag();
    await carregarVideos();

}



// =====================================
// FECHAR MODAL
// =====================================

function fecharModalTag(){

    document
        .getElementById("modalTag")
        .classList.remove("show");

}

// =====================================
// EVENTOS
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    const btn =
        document.getElementById("saveTagsVideo");

    if(btn){

        btn.addEventListener(
            "click",
            salvarTagsVideo
        );

    }

});

// ADICIONAR DESCRIÇÃO

let videoEditando = null;

async function abrirEditar(id) {

    videoEditando = id;

    const { data: video, error } = await db
        .from("biblioteca")
        .select("descricao, nome")
        .eq("id", id)
        .single();

    if (error) {
        console.log(error);
        return;
    }

    document.getElementById("editDescricao").value =
        video.descricao || "";

    document.getElementById("editTitulo").innerText =
        video.nome || "Editar vídeo";

    document.getElementById("modalEditar").classList.add("show");
}


async function salvarEdicao() {

    const descricao =
        document.getElementById("editDescricao").value;

    const { error } = await db
        .from("biblioteca")
        .update({
            descricao: descricao
        })
        .eq("id", videoEditando);

    if (error) {
        console.log(error);
        alert("Erro ao salvar");
        return;
    }

    alert("Descrição atualizada!");

    location.reload(); // ou carregarVideos()

}


function fecharEditar() {
    document.getElementById("modalEditar").classList.remove("show");
}