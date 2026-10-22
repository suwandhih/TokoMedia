package org.tokomedia.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import org.tokomedia.app.data.api.VideoDto
import org.tokomedia.app.data.languageName
import org.tokomedia.app.data.repository.TokoMediaRepository
import org.tokomedia.app.data.sampleVideos

enum class VideoSort(val label: String, val apiValue: String) {
    TRENDING("Trending", "trending"),
    POPULAR("Terpopuler", "popular"),
    NEWEST("Terbaru", "newest"),
    OLDEST("Terdahulu", "oldest")
}

@Composable
fun VideoListScreen(
    languageSlug: String,
    categorySlug: String = "film-riwayat-isa-al-masih",
    onVideoClick: (Int) -> Unit = {}
) {
    val language = languageName(languageSlug)
    val repository = remember { TokoMediaRepository() }
    var sort by remember { mutableStateOf(VideoSort.TRENDING) }
    var apiVideos by remember { mutableStateOf<List<VideoDto>?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(languageSlug, sort) {
        isLoading = true
        val result = repository.getVideosByCategory(categorySlug, languageSlug)
        if (result.isSuccess && !result.getOrNull().isNullOrEmpty()) {
            val list = result.getOrNull().orEmpty()
            apiVideos = when (sort) {
                VideoSort.TRENDING -> list
                VideoSort.POPULAR -> list.sortedByDescending { it.watchcounter }
                VideoSort.NEWEST -> list.sortedByDescending { it.datescheduleIso ?: it.dateschedule }
                VideoSort.OLDEST -> list.sortedBy { it.datescheduleIso ?: it.dateschedule }
            }
        } else {
            apiVideos = null // Gunakan fallback MockData jika API kosong
        }
        isLoading = false
    }

    val fallbackVideos = remember(language, sort) {
        val list = sampleVideos(language)
        when (sort) {
            VideoSort.TRENDING -> list
            VideoSort.POPULAR -> list.sortedByDescending { it.views }
            VideoSort.NEWEST -> list.sortedByDescending { it.publishedIso }
            VideoSort.OLDEST -> list.sortedBy { it.publishedIso }
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text(
                text = "Koleksi Media $language",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(VideoSort.entries) { option ->
                    FilterChip(
                        selected = sort == option,
                        onClick = { sort = option },
                        label = { Text(option.label) }
                    )
                }
            }
        }

        if (isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = TokoGreen)
                }
            }
        } else if (apiVideos != null) {
            items(apiVideos.orEmpty()) { video ->
                ApiVideoCard(video = video, onClick = { onVideoClick(video.id) })
            }
        } else {
            // Fallback jika bahasa offline / belum sinkron
            items(fallbackVideos) { video ->
                FallbackVideoCard(video)
            }
        }
    }
}

@Composable
private fun ApiVideoCard(video: VideoDto, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF222222))
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
                    style = MaterialTheme.typography.labelSmall,
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(6.dp)
                        .background(TokoLinkBlue, RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = video.displayTitle,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold
        )
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(text = "Tokomedia", color = TokoGreen, style = MaterialTheme.typography.labelMedium)
            Spacer(Modifier.width(4.dp))
            Icon(
                imageVector = Icons.Filled.CheckCircle,
                contentDescription = null,
                tint = TokoGreen,
                modifier = Modifier.size(14.dp)
            )
        }
        Text(
            text = "Dilihat ${video.watchcounter} • ${video.dateschedule.orEmpty()}",
            color = TokoMuted,
            style = MaterialTheme.typography.labelSmall
        )
    }
}

@Composable
private fun FallbackVideoCard(video: org.tokomedia.app.data.Video) {
    Column {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(8.dp))
                .background(Color(0xFF2B3A42))
        ) {
            Text(
                text = video.duration,
                color = Color.White,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(6.dp)
                    .background(TokoLinkBlue, RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            )
        }
        Spacer(Modifier.height(8.dp))
        Text(
            text = video.title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Dilihat ${video.views} • ${video.dateLabel}",
            color = TokoMuted,
            style = MaterialTheme.typography.labelSmall
        )
    }
}
