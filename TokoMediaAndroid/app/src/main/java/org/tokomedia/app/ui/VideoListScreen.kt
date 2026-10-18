package org.tokomedia.app.ui

import androidx.compose.foundation.background
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
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.tokomedia.app.data.Video
import org.tokomedia.app.data.languageName
import org.tokomedia.app.data.sampleVideos

enum class VideoSort(val label: String) {
    TRENDING("Trending"),
    POPULAR("Terpopuler"),
    NEWEST("Terbaru"),
    OLDEST("Terdahulu")
}

@Composable
fun VideoListScreen(languageSlug: String) {
    val language = languageName(languageSlug)
    var sort by remember { mutableStateOf(VideoSort.TRENDING) }
    val videos = remember(language, sort) {
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
        verticalArrangement = Arrangement.spacedBy(12.dp)
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
        items(videos) { video -> VideoCard(video) }
    }
}

@Composable
private fun VideoCard(video: Video) {
    Column {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 9f)
                .clip(RoundedCornerShape(8.dp))
                .background(Brush.linearGradient(listOf(TokoHeader, TokoSidebar)))
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
            text = "Dilihat ${video.views} • ${video.dateLabel}",
            color = TokoMuted,
            style = MaterialTheme.typography.labelSmall
        )
    }
}
