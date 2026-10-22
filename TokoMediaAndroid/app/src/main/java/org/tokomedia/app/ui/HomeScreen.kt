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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import org.tokomedia.app.data.Category
import org.tokomedia.app.data.HomeCategories
import org.tokomedia.app.data.HomeLanguages
import org.tokomedia.app.data.Language
import org.tokomedia.app.data.Target
import org.tokomedia.app.data.api.VideoDto
import org.tokomedia.app.data.repository.TokoMediaRepository

@Composable
fun HomeScreen(
    onTargetClick: (Target) -> Unit,
    onVideoClick: (Int) -> Unit = {}
) {
    val repository = remember { TokoMediaRepository() }
    var latestVideos by remember { mutableStateOf<List<VideoDto>>(emptyList()) }
    var isLoadingLatest by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        val result = repository.getLatestVideos()
        if (result.isSuccess) {
            latestVideos = result.getOrNull().orEmpty()
        }
        isLoadingLatest = false
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        items(HomeCategories.chunked(2)) { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                row.forEach { category ->
                    CategoryCard(category, Modifier.weight(1f)) { onTargetClick(category.target) }
                }
                if (row.size < 2) Spacer(Modifier.weight(1f))
            }
        }

        item {
            HorizontalDivider(modifier = Modifier.padding(top = 8.dp))
            Text(
                text = "Tayangan Terbaru (Live API)",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)
            )
        }

        if (isLoadingLatest) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(130.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = TokoGreen)
                }
            }
        } else if (latestVideos.isNotEmpty()) {
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(latestVideos) { video ->
                        LatestVideoCard(video = video, onClick = { onVideoClick(video.id) })
                    }
                }
            }
        }

        item {
            HorizontalDivider(modifier = Modifier.padding(top = 8.dp))
            Text(
                text = "Kategori Bahasa & Wilayah",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 10.dp, bottom = 4.dp)
            )
        }
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(HomeLanguages) { language ->
                    LanguageBubble(language) { onTargetClick(Target.Videos(language.slug)) }
                }
            }
        }
    }
}

@Composable
private fun LatestVideoCard(video: VideoDto, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(170.dp)
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
                        .padding(4.dp)
                        .background(Color.Black.copy(alpha = 0.75f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 4.dp, vertical = 2.dp)
                )
            }
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = video.displayTitle,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.SemiBold,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Text(
            text = "${video.watchcounter} views",
            color = TokoMuted,
            style = MaterialTheme.typography.labelSmall
        )
    }
}

@Composable
private fun CategoryCard(category: Category, modifier: Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .height(110.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Brush.horizontalGradient(category.colors))
            .clickable(onClick = onClick)
            .padding(12.dp)
    ) {
        Text(
            text = category.title,
            color = category.textColor,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.align(Alignment.TopStart)
        )
        Row(
            modifier = Modifier.align(Alignment.BottomStart),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = category.action,
                color = category.textColor,
                style = MaterialTheme.typography.labelMedium
            )
            Icon(
                imageVector = Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = category.textColor,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
private fun LanguageBubble(language: Language, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(88.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(CircleShape)
                .background(TokoGreen.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = language.name.take(2).uppercase(),
                color = TokoGreen,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = language.name,
            style = MaterialTheme.typography.labelMedium,
            textAlign = TextAlign.Center,
            maxLines = 2
        )
    }
}
