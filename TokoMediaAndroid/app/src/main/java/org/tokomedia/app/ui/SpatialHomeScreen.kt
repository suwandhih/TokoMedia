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
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import org.tokomedia.app.data.BentoCategories
import org.tokomedia.app.data.BentoCategory
import org.tokomedia.app.data.HomeLanguages
import org.tokomedia.app.data.Language
import org.tokomedia.app.data.Target
import org.tokomedia.app.data.api.VideoDto
import org.tokomedia.app.data.repository.TokoMediaRepository

@Composable
fun SpatialHomeScreen(
    onTargetClick: (Target) -> Unit,
    onWatchHeroClick: () -> Unit,
    onVideoClick: (Int) -> Unit
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
        modifier = Modifier
            .fillMaxSize()
            .background(TokoBg),
        contentPadding = PaddingValues(start = 14.dp, end = 14.dp, top = 8.dp, bottom = 75.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // 1. HERO BENTO CARD (Spatial Glass Card)
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(8.dp, RoundedCornerShape(22.dp), spotColor = Color(0x140F172A))
                    .clip(RoundedCornerShape(22.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(
                                Color(0xFFFFFFFF),
                                Color(0xFFEDF8F2),
                                Color(0xFFD7F0E3)
                            )
                        )
                    )
                    .padding(16.dp)
            ) {
                Column {
                    // Pill: PUSAT MEDIA NUSANTARA
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(99.dp))
                            .background(Color(0xFFE2F4EB))
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(TokoGreen)
                        )
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = "PUSAT MEDIA NUSANTARA",
                            color = TokoGreen,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp
                        )
                    }

                    Spacer(Modifier.height(10.dp))

                    Text(
                        text = "Film, Video &\nAplikasi Kitab Suci Nusantara.",
                        color = TokoText,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        lineHeight = 28.sp
                    )

                    Spacer(Modifier.height(8.dp))

                    Text(
                        text = "Nikmati ribuan tayangan rohani bermakna, kisah para nabi, serta aplikasi Kitab Suci Android dalam bahasa ibu dari Sabang sampai Merauke.",
                        color = TokoTextSecondary,
                        fontSize = 12.5.sp,
                        lineHeight = 18.sp
                    )

                    Spacer(Modifier.height(14.dp))

                    // Tombol Aksi Hero
                    Button(
                        onClick = onWatchHeroClick,
                        colors = ButtonDefaults.buttonColors(containerColor = TokoGreen),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(42.dp)
                    ) {
                        Icon(Icons.Filled.PlayArrow, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text(
                            text = "Tonton Tayangan Sorotan",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    Spacer(Modifier.height(8.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color.White)
                            .clickable { onTargetClick(Target.Languages("film-riwayat-isa-al-masih")) }
                            .padding(vertical = 10.dp, horizontal = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Jelajahi Wilayah ",
                            color = TokoText,
                            fontSize = 12.5.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowForward,
                            contentDescription = null,
                            tint = TokoText,
                            modifier = Modifier.size(15.dp)
                        )
                    }
                }
            }
        }

        // 2. SECTION 01: PILIH FORMAT MEDIA (Bento Grid)
        item {
            Column(modifier = Modifier.fillMaxWidth().padding(top = 4.dp)) {
                Text(
                    text = "01 • KATEGORI UTAMA",
                    color = TokoGreen,
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.2.sp
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "Pilih Format Media",
                    color = TokoText,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "Ketuk kartu untuk melihat daftar bahasa per wilayah",
                    color = TokoMuted,
                    fontSize = 12.5.sp
                )
            }
        }

        // Kartu Utama 1 (Full Width: Film Isa Al-Masih)
        item {
            val firstCat = BentoCategories[0]
            FullWidthBentoCard(category = firstCat) { onTargetClick(firstCat.target) }
        }

        // 4 Kartu Bento Berikutnya (Grid 2 kolom)
        item {
            val rest = BentoCategories.drop(1)
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                rest.chunked(2).forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        pair.forEach { cat ->
                            MiniBentoCard(
                                category = cat,
                                modifier = Modifier.weight(1f)
                            ) { onTargetClick(cat.target) }
                        }
                        if (pair.size < 2) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        // 3. SECTION TAYANGAN TERBARU (Live API)
        item {
            Column(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                Text(
                    text = "02 • TAYANGAN TERBARU",
                    color = TokoGreen,
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.2.sp
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "Sorotan Media Nusantara",
                    color = TokoText,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }

        if (isLoadingLatest) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = TokoGreen)
                }
            }
        } else if (latestVideos.isNotEmpty()) {
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(latestVideos) { video ->
                        BentoVideoCard(video = video, onClick = { onVideoClick(video.id) })
                    }
                }
            }
        }

        // 4. SECTION EKSPLORASI BAHASA (Bubbles/Squircles)
        item {
            Column(modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                Text(
                    text = "03 • EKSPLORASI BAHASA",
                    color = TokoGreen,
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 1.2.sp
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "Kategori Bahasa & Format",
                    color = TokoText,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }

        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(HomeLanguages) { lang ->
                    BentoLanguageBubble(language = lang) {
                        onTargetClick(Target.Videos(lang.slug))
                    }
                }
            }
        }
    }
}

@Composable
private fun FullWidthBentoCard(category: BentoCategory, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(6.dp, RoundedCornerShape(20.dp), spotColor = Color(0x100F172A))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.linearGradient(category.bgGrad))
            .clickable(onClick = onClick)
            .padding(18.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(category.iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Filled.Movie, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(99.dp))
                        .background(Color.White)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = category.badge,
                        color = TokoText,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )
                }
            }

            Spacer(Modifier.height(14.dp))

            Text(
                text = category.title,
                color = TokoText,
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold
            )
            Spacer(Modifier.height(3.dp))
            Text(
                text = category.subtitle,
                color = TokoTextSecondary,
                fontSize = 12.5.sp
            )

            Spacer(Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = category.countLabel,
                    color = category.accentColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Daftar Bahasa ›",
                    color = TokoText,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun MiniBentoCard(category: BentoCategory, modifier: Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier
            .height(175.dp)
            .shadow(6.dp, RoundedCornerShape(20.dp), spotColor = Color(0x100F172A))
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.linearGradient(category.bgGrad))
            .clickable(onClick = onClick)
            .padding(14.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.SpaceBetween) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(category.iconBg),
                    contentAlignment = Alignment.Center
                ) {
                    val icon = when (category.iconType) {
                        "video" -> Icons.Filled.Videocam
                        "clip" -> Icons.Filled.PlayArrow
                        "app" -> Icons.Filled.PhoneAndroid
                        else -> Icons.Filled.VideoLibrary
                    }
                    Icon(icon, contentDescription = null, tint = Color.White, modifier = Modifier.size(18.dp))
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(99.dp))
                        .background(Color.White)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = category.badge.take(10),
                        color = TokoText,
                        fontSize = 8.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Column {
                Text(
                    text = category.title,
                    color = TokoText,
                    fontSize = 14.5.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = category.subtitle,
                    color = TokoTextSecondary,
                    fontSize = 10.5.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = category.countLabel,
                    color = category.accentColor,
                    fontSize = 10.5.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(text = "›", color = TokoText, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun BentoVideoCard(video: VideoDto, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(190.dp)
            .shadow(4.dp, RoundedCornerShape(16.dp), spotColor = Color(0x100F172A))
            .clip(RoundedCornerShape(16.dp))
            .background(Color.White)
            .clickable(onClick = onClick)
            .padding(10.dp)
    ) {
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
            fontSize = 12.5.sp,
            fontWeight = FontWeight.Bold,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(Modifier.height(3.dp))
        Text(
            text = "${video.watchcounter} views • ${video.dateschedule.orEmpty()}",
            color = TokoMuted,
            fontSize = 10.5.sp
        )
    }
}

@Composable
private fun BentoLanguageBubble(language: Language, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(84.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .shadow(3.dp, CircleShape, spotColor = Color(0x150F172A))
                .clip(CircleShape)
                .background(Color.White),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = language.name.take(2).uppercase(),
                color = TokoGreen,
                fontSize = 15.sp,
                fontWeight = FontWeight.ExtraBold
            )
        }
        Spacer(Modifier.height(6.dp))
        Text(
            text = language.name,
            color = TokoText,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
    }
}
