// CONFIGURANDO O EXPRESS E O SERVER
const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
// CONFIGURANDO O EXPRESS E O SERVER

// Configurando o CORS //
const corsOptions = {
  origin: '*',
  methods: 'GET',
};
app.use(cors(corsOptions));
// Configurando o CORS //

// CONFIGURANDO A API DO YOUTUBE
const { google } = require('googleapis');
const { composer } = require('googleapis/build/src/apis/composer');
const { content } = require('googleapis/build/src/apis/content');
const api_key = process.env.API_KEY; // Alterar para sua API_KEY
// CONFIGURANDO A API DO YOUTUBE

// Requisição pela API   //
app.get('/playlist-info', async (req, res) => {
  const url = req.query.url;
  const playlistURL = new URL(url);
  const playlistId = playlistURL.searchParams.get('list');

  if (playlistId) {
    const youtube = google.youtube({
      version: 'v3',
      auth: api_key
    });

    youtube.playlists.list({
      part: 'snippet, contentDetails',
      id: playlistId
    })
    .then(response => {
      if (response.data.items.length > 0) {
        const playlistInfo = response.data.items[0];
        const snippet = playlistInfo.snippet;
        const contentDetails = playlistInfo.contentDetails;
        const thumbnails = snippet.thumbnails;
        const highResThumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default;

        const playlistInformacoes = {
          thumbnail: highResThumbnail.url,
          playlistLink: `https://www.youtube.com/playlist?list=${playlistInfo.id}`,
          titulo: snippet.title,
          criador: snippet.channelTitle,
          QntdVideo: contentDetails.itemCount,
        };
        const videoDetailsPromises = [];
        let nextPageToken = null;
        
        const fetchVideoDetails = () => {
          const maxResults = 50; 

          const fetchPage = (pageToken) => {
            return youtube.playlistItems.list({
              part: 'snippet',
              playlistId: playlistId,
              maxResults: maxResults,
              pageToken: pageToken
            })
            .then(response => {
              const videoItems = response.data.items;
              nextPageToken = response.data.nextPageToken;
        
              const videoIds = videoItems.map(item => item.snippet.resourceId.videoId);
              const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${api_key}&id=${videoIds.join(',')}&part=snippet,contentDetails`;
        
              return axios.get(videoDetailsUrl)
                .then(videoDetailResponse => videoDetailResponse.data.items)
                .catch(error => []);
            });
          };
        
          const fetchAllPages = (pageToken) => {
            return fetchPage(pageToken)
              .then(videoDetails => {
                videoDetailsPromises.push(...videoDetails);
        
                if (nextPageToken) {
                  return fetchAllPages(nextPageToken);
                }
        
                return Promise.resolve(videoDetailsPromises);
              });
          };
        
          return fetchAllPages(null);
        };
        
        fetchVideoDetails()
        .then(videoDetails => {
          let videoDurations = [];
      
          for (const videoDetail of videoDetails) {
            const videoDuration = videoDetail.contentDetails.duration;
            videoDurations.push(videoDuration);
          }
      
          playlistInformacoes.videoDetails = videoDurations;
          res.json(playlistInformacoes);
        })
        .catch(error => {
          console.error('Erro ao obter detalhes dos vídeos', error);
          res.status(500).json({ error: 'Erro ao obter detalhes dos vídeos' });
        });
      } else {  
        res.status(404).json({ error: 'Playlist não encontrada' });
      }
    })
    .catch(error => {
      console.error('Erro na solicitação', error);
      res.status(500).json({ error: 'Erro na solicitação' });
    });
  } else {
    res.status(400).json({ error: 'URL da playlist não fornecida' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Express está rodando na porta ${PORT}`);
});
