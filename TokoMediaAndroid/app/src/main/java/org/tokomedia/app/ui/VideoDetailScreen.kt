package org.tokomedia.app.ui

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import org.tokomedia.app.data.api.VideoDetailDto
import org.tokomedia.app.data.repository.TokoMediaRepository

@OptIn(UnstableApi::class)
@Composable
fun VideoDetailScreen(
    videoId: Int,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val repository = remember { TokoMediaRepository() }
    var detail by remember { mutableStateOf<VideoDetailDto?>(null) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val exoPlayer = remember {
        ExoPlayer.Builder(context).build()
    }

    DisposableEffect(exoPlayer) {
        onDispose {
            exoPlayer.release()
        }
    }

    LaunchedEffect(videoId) {
        isLoading = true
        errorMessage = null
        val result = repository.getVideoDetail(videoId)
        if (result.isSuccess) {
            val data = result.getOrNull()
            detail = data
            if (data != null && data.source.isNotEmpty()) {
                val mediaItem = MediaItem.fromUri(data.source)
                exoPlayer.setMediaItem(mediaItem)
                exoPlayer.prepare()
                exoPlayer.playWhenReady = true
            }
        } else {
            errorMessage = result.exceptionOrNull()?.message ?: "Gagal memuat video"
        }
        isLoading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
    ) {
        // Area Pemutar Video ExoPlayer (16:9)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .background(Color.Black),
            contentAlignment = Alignment.Center
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = TokoGreen)
            } else if (errorMessage != null) {
                Text(
                    text = errorMessage.orEmpty(),
                    color = Color.White,
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(16.dp)
                )
            } else {
                AndroidView(
                    factory = { ctx ->
                        PlayerView(ctx).apply {
                            player = exoPlayer
                            layoutParams = FrameLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            useController = true
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        // Keterangan / Informasi Video
        detail?.let { item ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Dilihat: ${item.watchcounter} • Disukai: ${item.favcounter} • ${item.dateschedule.orEmpty()}",
                    style = MaterialTheme.typography.labelSmall,
                    color = TokoMuted
                )
                if (!item.content.isNullOrEmpty()) {
                    Spacer(Modifier.height(14.dp))
                    Text(
                        text = "Deskripsi",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(4.dp))
                    Text(
                        text = item.content,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF333333)
                    )
                }
            }
        }
    }
}
