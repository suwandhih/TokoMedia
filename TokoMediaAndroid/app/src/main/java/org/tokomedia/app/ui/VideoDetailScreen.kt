package org.tokomedia.app.ui

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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

    // Panggil API untuk mendapatkan detail video real-time
    LaunchedEffect(videoId) {
        isLoading = true
        errorMessage = null
        val result = repository.getVideoDetail(videoId)
        if (result.isSuccess) {
            val data = result.getOrNull()
            if (data != null && data.id != 0) {
                detail = data
                if (data.source.isNotEmpty()) {
                    val mediaItem = MediaItem.fromUri(data.source)
                    exoPlayer.setMediaItem(mediaItem)
                    exoPlayer.prepare()
                    exoPlayer.playWhenReady = true
                }
            } else {
                // Fallback default jika data video spesifik belum ada
                detail = VideoDetailDto(
                    id = videoId,
                    title = "Tayangan Media TokoMedia",
                    content = "Koleksi tayangan rohani dan kisah para nabi dalam bahasa daerah Nusantara.",
                    source = "https://61146e7ab7a66.streamlock.net:8089/tokomedia/definst/mp4:1. RIA/RIA Indonesia/01 Pada Mulanya Saat Penciptaan - Indonesia.mp4/playlist.m3u8",
                    watchcounter = 10222,
                    favcounter = 693,
                    dateschedule = "01 Aug 24"
                )
                val mediaItem = MediaItem.fromUri("https://61146e7ab7a66.streamlock.net:8089/tokomedia/definst/mp4:1. RIA/RIA Indonesia/01 Pada Mulanya Saat Penciptaan - Indonesia.mp4/playlist.m3u8")
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
            .background(TokoBg)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 90.dp)
    ) {
        // Player Video Box (16:9)
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

        Spacer(Modifier.height(14.dp))

        // Info Card Identik dengan index.html #watch
        detail?.let { item ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Judul & Statistik Card
                Surface(
                    shape = RoundedCornerShape(22.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "INDONESIA",
                            color = TokoGreen,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = item.title,
                            color = TokoText,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            lineHeight = 26.sp
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "Dilihat ${item.watchcounter} kali",
                            color = TokoMuted,
                            fontSize = 12.sp
                        )

                        Spacer(Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(TokoGreen),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text("⌂", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                }
                                Spacer(Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "Tokomedia ✔",
                                        color = TokoGreen,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Publikasi ${item.dateschedule.orEmpty()}",
                                        color = TokoMuted,
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(99.dp))
                                    .background(Color(0xFFF1F5F9))
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(Icons.Filled.Favorite, contentDescription = null, tint = Color(0xFFE11D48), modifier = Modifier.size(15.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Suka · ${item.favcounter}", color = TokoText, fontSize = 11.5.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }

                // Deskripsi Card
                if (!item.content.isNullOrEmpty()) {
                    Surface(
                        shape = RoundedCornerShape(22.dp),
                        color = Color.White,
                        shadowElevation = 4.dp,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(18.dp)) {
                            Text(
                                text = "Deskripsi & Tag",
                                color = TokoText,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(Modifier.height(6.dp))
                            Text(
                                text = item.content,
                                color = TokoTextSecondary,
                                fontSize = 13.sp,
                                lineHeight = 19.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
