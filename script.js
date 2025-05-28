document.addEventListener('DOMContentLoaded', () => {
    const youtubeUrlInput = document.getElementById('youtubeUrlInput');
    const downloadButton = document.getElementById('downloadButton');
    const messageDiv = document.getElementById('message');

    // MANTER URL atualizada com a URL do backend no Heroku (ou outro serviço)
    const backendApiUrl = 'https://seu-app-incrivel.herokuapp.com/download_transcript'; // <-- MUITO IMPORTANTE: Mude para a URL do seu backend!

    downloadButton.addEventListener('click', async () => {
        const youtubeUrl = youtubeUrlInput.value.trim();
        messageDiv.textContent = ''; // Limpa mensagens anteriores

        if (!youtubeUrl) {
            messageDiv.textContent = 'Por favor, insira uma URL do YouTube.';
            messageDiv.style.color = '#d9534f';
            return;
        }

        if (!youtubeUrl.includes('youtube.com/watch?v=') && !youtubeUrl.includes('youtu.be/')) {
            messageDiv.textContent = 'URL inválida. Por favor, insira um link válido do YouTube.';
            messageDiv.style.color = '#d9534f';
            return;
        }

        downloadButton.disabled = true;
        downloadButton.textContent = 'Baixando...';
        messageDiv.textContent = 'Processando sua solicitação...';
        messageDiv.style.color = '#007bff';

        try {
            const response = await fetch(backendApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ youtube_url: youtubeUrl }),
            });

            if (response.ok) {
                // Se a resposta for um arquivo, crie um link para download
                const blob = await response.blob();
                const disposition = response.headers.get('Content-Disposition');
                let filename = 'legenda.txt';
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) {
                        filename = decodeURIComponent(matches[1].replace(/['"]/g, ''));
                    }
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                messageDiv.textContent = 'Legenda baixada com sucesso!';
                messageDiv.style.color = '#5cb85c';
            } else {
                const errorData = await response.json();
                messageDiv.textContent = `Erro: ${errorData.error || 'Ocorreu um erro desconhecido.'}`;
                messageDiv.style.color = '#d9534f';
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            messageDiv.textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
            messageDiv.style.color = '#d9534f';
        } finally {
            downloadButton.disabled = false;
            downloadButton.textContent = 'Baixar Legenda';
        }
    });
});