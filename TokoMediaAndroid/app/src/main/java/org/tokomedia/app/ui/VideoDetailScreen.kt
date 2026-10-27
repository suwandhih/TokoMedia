package org.tokomedia.app.ui

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.annotation.OptIn
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import org.tokomedia.app.data.api.VideoDetailDto
import org.tokomedia.app.data.api.VideoDto
import org.tokomedia.app.data.repository.TokoMediaRepository

@OptIn(UnstableApi::class)
@Composable
fun VideoDetailScreen(
    videoId: Int,
    onBackClick: () -> Unit = {},
    onVideoClick: (Int) -> Unit = {}
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val repository = remember { TokoMediaRepository() }

    var detail by remember { mutableStateOf<VideoDetailDto?>(null) }
    var relatedVideos by remember { mutableStateOf<List<VideoDto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    var isLiked by remember { mutableStateOf(false) }
    var likeCount by remember { mutableStateOf(0L) }

    // Form Tanggapan Anda
    var formName by remember { mutableStateOf("") }
    var formEmail by remember { mutableStateOf("") }
    var formPhone by remember { mutableStateOf("") }
    var formMessage by remember { mutableStateOf("") }
    var isSubmittingComment by remember { mutableStateOf(false) }
    var commentStatusText by remember { mutableStateOf<String?>(null) }
    var commentIsError by remember { mutableStateOf(false) }

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
            if (data != null && data.id != 0) {
                detail = data
                likeCount = data.favcounter
                relatedVideos = data.recomended.orEmpty()
                if (data.source.isNotEmpty()) {
                    val mediaItem = MediaItem.fromUri(data.source)
                    exoPlayer.setMediaItem(mediaItem)
                    exoPlayer.prepare()
                    exoPlayer.playWhenReady = true
                }
            } else {
                errorMessage = "Detail tayangan tidak tersedia. Silakan kembali dan coba lagi."
            }
        } else {
            errorMessage = result.exceptionOrNull()?.message ?: "Gagal memuat video"
        }

        // Jika related videos dari detail kosong, ambil dari latest video sebagai cadangan
        if (relatedVideos.isEmpty()) {
            val latestResult = repository.getLatestVideos()
            if (latestResult.isSuccess) {
                relatedVideos = latestResult.getOrNull().orEmpty().filter { it.id != videoId }.take(4)
            }
        }
        isLoading = false
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TokoBg)
    ) {
        // Player Video Box (16:9) FREEZE / TETAP DI ATAS
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
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = errorMessage.orEmpty(),
                        color = Color.White,
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Button(onClick = onBackClick, modifier = Modifier.padding(top = 12.dp)) {
                        Text("Kembali")
                    }
                }
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

        // Bagian di bawah video yang bisa di-scroll bebas
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(bottom = 90.dp)
        ) {
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

                        BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
                            // Di layar sempit tombol Suka turun ke baris berikutnya agar nama kanal tetap utuh.
                            val stackActions = maxWidth < 330.dp

                            val channelInfo: @Composable (Modifier) -> Unit = { infoModifier ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = infoModifier
                                ) {
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
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            text = "Tokomedia ✔",
                                            color = TokoGreen,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            text = "Publikasi ${item.dateschedule.orEmpty()}",
                                            color = TokoMuted,
                                            fontSize = 11.sp,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                }
                            }

                            val likeButton: @Composable () -> Unit = {
                                Surface(
                                    shape = RoundedCornerShape(99.dp),
                                    color = if (isLiked) Color(0xFFE11D48) else Color.White,
                                    border = BorderStroke(1.dp, Color(0xFFE11D48)),
                                    shadowElevation = 1.dp,
                                    modifier = Modifier.clickable {
                                        if (!isLiked) {
                                            isLiked = true
                                            likeCount += 1
                                            scope.launch {
                                                val likeRes = repository.likeVideo(item.id)
                                                if (likeRes.isSuccess && (likeRes.getOrNull() ?: 0L) > 0L) {
                                                    likeCount = likeRes.getOrNull()!!
                                                }
                                            }
                                        }
                                    }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Filled.Favorite,
                                            contentDescription = "Suka",
                                            tint = if (isLiked) Color.White else Color(0xFFE11D48),
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(Modifier.width(6.dp))
                                        Text(
                                            text = if (likeCount > 0) "Suka · $likeCount" else "Suka",
                                            color = if (isLiked) Color.White else Color(0xFFE11D48),
                                            fontSize = 12.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            softWrap = false
                                        )
                                    }
                                }
                            }

                            if (stackActions) {
                                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                    channelInfo(Modifier.fillMaxWidth())
                                    likeButton()
                                }
                            } else {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    channelInfo(Modifier.weight(1f))
                                    likeButton()
                                }
                            }
                        }
                    }
                }

                // Deskripsi & Tag Card
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
                            if (!item.tag.isNullOrEmpty()) {
                                Spacer(Modifier.height(10.dp))
                                Text(
                                    text = item.tag,
                                    color = TokoGreen,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }

                // =================================================================
                // TANGGAPAN ANDA (FORMULIR KOMENTAR TERHUBUNG KE RUMAHWEB)
                // =================================================================
                Surface(
                    shape = RoundedCornerShape(22.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "Tanggapan Anda",
                            color = TokoText,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = "Kirim pesan, pertanyaan, atau tanggapan Anda langsung ke server TokoMedia.",
                            color = TokoMuted,
                            fontSize = 12.5.sp
                        )

                        Spacer(Modifier.height(14.dp))

                        // Nama Anda
                        OutlinedTextField(
                            value = formName,
                            onValueChange = { formName = it },
                            label = { Text("Nama Anda") },
                            placeholder = { Text("Ketik nama lengkap Anda") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = TokoGreen,
                                unfocusedBorderColor = Color(0xFFE2E8F0)
                            )
                        )

                        Spacer(Modifier.height(10.dp))

                        // Email
                        OutlinedTextField(
                            value = formEmail,
                            onValueChange = { formEmail = it },
                            label = { Text("Email") },
                            placeholder = { Text("Isi alamat email Anda") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = TokoGreen,
                                unfocusedBorderColor = Color(0xFFE2E8F0)
                            )
                        )

                        Spacer(Modifier.height(10.dp))

                        // Nomor HP
                        OutlinedTextField(
                            value = formPhone,
                            onValueChange = { formPhone = it },
                            label = { Text("Nomor HP") },
                            placeholder = { Text("+62 xxxxxxxxxx") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = TokoGreen,
                                unfocusedBorderColor = Color(0xFFE2E8F0)
                            )
                        )

                        Spacer(Modifier.height(10.dp))

                        // Tanggapan
                        OutlinedTextField(
                            value = formMessage,
                            onValueChange = { formMessage = it },
                            label = { Text("Tanggapan setelah melihat klip ini") },
                            placeholder = { Text("Isi ulasan/komentar/tanggapan Anda") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3,
                            maxLines = 5,
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = TokoGreen,
                                unfocusedBorderColor = Color(0xFFE2E8F0)
                            )
                        )

                        if (!commentStatusText.isNullOrEmpty()) {
                            Spacer(Modifier.height(8.dp))
                            Text(
                                text = commentStatusText.orEmpty(),
                                color = if (commentIsError) Color(0xFFE11D48) else TokoGreen,
                                fontSize = 12.5.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(Modifier.height(14.dp))

                        Button(
                            onClick = {
                                if (formName.isBlank() || formEmail.isBlank() || formMessage.isBlank()) {
                                    commentIsError = true
                                    commentStatusText = "Mohon lengkapi Nama, Email, dan Tanggapan Anda."
                                    return@Button
                                }
                                scope.launch {
                                    isSubmittingComment = true
                                    commentStatusText = "Mengirim tanggapan..."
                                    val sendResult = repository.sendComment(
                                        name = formName,
                                        email = formEmail,
                                        phone = formPhone,
                                        message = formMessage,
                                        videoId = item.id,
                                        videoTitle = item.title
                                    )
                                    if (sendResult.isSuccess) {
                                        commentIsError = false
                                        commentStatusText = sendResult.getOrNull() ?: "Terima kasih, tanggapan Anda berhasil tersimpan!"
                                        formMessage = ""
                                    } else {
                                        commentIsError = true
                                        commentStatusText = sendResult.exceptionOrNull()?.message ?: "Gagal mengirim tanggapan."
                                    }
                                    isSubmittingComment = false
                                }
                            },
                            enabled = !isSubmittingComment,
                            colors = ButtonDefaults.buttonColors(containerColor = TokoGreen),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                        ) {
                            if (isSubmittingComment) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp))
                            } else {
                                Text(
                                    text = "KIRIM TANGGAPAN",
                                    color = Color.White,
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // =================================================================
                // TAYANGAN LAINNYA
                // =================================================================
                if (relatedVideos.isNotEmpty()) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Tayangan Lainnya",
                            color = TokoText,
                            fontSize = 19.sp,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
                        )

                        relatedVideos.forEach { relVideo ->
                            RelatedVideoCard(
                                video = relVideo,
                                onClick = { onVideoClick(relVideo.id) }
                            )
                        }
                    }
                }
            }
        }
        }
    }
}

@Composable
private fun RelatedVideoCard(video: VideoDto, onClick: () -> Unit) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        shadowElevation = 3.dp,
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(10.dp)) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF1E293B))
            ) {
                if (!video.thumbnail.isNullOrEmpty()) {
                    AsyncImage(
                        model = video.thumbnail,
                        contentDescription = video.displayTitle,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }
                if (!video.duration.isNullOrEmpty()) {
                    Text(
                        text = video.duration,
                        color = Color.White,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(4.dp)
                            .background(Color.Black.copy(alpha = 0.75f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 4.dp, vertical = 2.dp)
                    )
                }
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = video.displayTitle,
                color = TokoText,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(Modifier.height(3.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text = "Tokomedia", color = TokoGreen, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.width(3.dp))
                Icon(
                    imageVector = Icons.Filled.CheckCircle,
                    contentDescription = null,
                    tint = TokoGreen,
                    modifier = Modifier.size(12.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "${video.watchcounter} views • ${video.dateschedule.orEmpty()}",
                    color = TokoMuted,
                    fontSize = 10.5.sp
                )
            }
        }
    }
}
