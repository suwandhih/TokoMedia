package org.tokomedia.app.ui

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.LightMode
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.tokomedia.app.R

@Composable
fun SpatialTopBar(
    canGoBack: Boolean,
    onMenuClick: () -> Unit,
    onBackClick: () -> Unit,
    onHomeClick: () -> Unit = {},
    breadcrumbs: List<BreadcrumbItem> = listOf(BreadcrumbItem("Beranda")),
    onSearchClick: () -> Unit = {},
    isDarkTheme: Boolean = false,
    onThemeToggle: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.95f))
    ) {
        BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
        // Tombol aksi mengecil di layar sempit agar logo tetap punya ruang.
        val actionSize = if (maxWidth < 360.dp) 36.dp else 42.dp
        val actionIcon = if (maxWidth < 360.dp) 18.dp else 20.dp
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Tombol Menu
            IconButton(
                onClick = onMenuClick,
                modifier = Modifier
                    .size(actionSize)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Icon(
                    imageVector = Icons.Filled.Menu,
                    contentDescription = "Menu",
                    tint = TokoText,
                    modifier = Modifier.size(actionIcon)
                )
            }

            // Tombol Back (muncul jika canGoBack true, sama seperti screenshot)
            if (canGoBack) {
                Spacer(Modifier.width(4.dp))
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .size(actionSize)
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surface)
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Kembali",
                        tint = TokoText,
                        modifier = Modifier.size(actionIcon)
                    )
                }
            }

            Spacer(Modifier.width(8.dp))

            // Logo TokoMedia Resmi + Tagline MEDIA NUSANTARA
            // Ukuran logo dihitung dari lebar tersedia agar tidak terpotong di layar sempit.
            Column(
                modifier = Modifier
                    .weight(1f)
                    .clickable { onHomeClick() }
            ) {
                BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
                    // Lebar teks ikut skala font HP, sedangkan ikon & spasi tetap dalam dp.
                    // 66dp = ikon logo + spasi + tombol play + pause bar.
                    // 5.6 = 7 huruf kapital (TOK MED A) x faktor lebar 0.8 per em.
                    val fontScale = LocalDensity.current.fontScale
                    val logoFont = ((maxWidth.value - 66f) / (5.6f * fontScale))
                        .coerceIn(9f, 16f)
                    val markSize = (logoFont * 1.75f).dp
                    Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.clipToBounds()
                    ) {
                        // Logo resmi TokoMedia (ikon toko hijau + pin lokasi merah)
                        Image(
                            painter = painterResource(R.drawable.ic_tm_logo),
                            contentDescription = "Logo TokoMedia",
                            modifier = Modifier.size(markSize)
                        )
                        Spacer(Modifier.width(5.dp))
                        Text("TOK", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = logoFont.sp, maxLines = 1, softWrap = false)
                        Spacer(Modifier.width(2.dp))
                        // Tombol Play Hijau
                        Box(
                            modifier = Modifier
                                .size((logoFont * 0.95f).dp)
                                .clip(CircleShape)
                                .background(TokoGreen),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.PlayArrow, contentDescription = null, tint = Color.White, modifier = Modifier.size((logoFont * 0.62f).dp))
                        }
                        Spacer(Modifier.width(2.dp))
                        Text("MED", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = logoFont.sp, maxLines = 1, softWrap = false)
                        Spacer(Modifier.width(2.dp))
                        // Pause Bar Hijau
                        Row {
                            Box(modifier = Modifier.width(3.dp).height((logoFont * 0.75f).dp).background(TokoGreen, RoundedCornerShape(1.dp)))
                            Spacer(Modifier.width(2.dp))
                            Box(modifier = Modifier.width(3.dp).height((logoFont * 0.75f).dp).background(TokoGreen, RoundedCornerShape(1.dp)))
                        }
                        Spacer(Modifier.width(2.dp))
                        Text("A", color = TokoText, fontWeight = FontWeight.ExtraBold, fontSize = logoFont.sp, maxLines = 1, softWrap = false)
                    }
                    Text(
                        text = "MEDIA NUSANTARA",
                        color = TokoMuted,
                        fontSize = (logoFont * 0.47f).coerceAtLeast(6f).sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = (logoFont * 0.1f).sp,
                        maxLines = 1,
                        softWrap = false
                    )
                    }
                }
            }

            // Tombol Search
            IconButton(
                onClick = onSearchClick,
                modifier = Modifier
                    .size(actionSize)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Icon(
                    imageVector = Icons.Filled.Search,
                    contentDescription = "Cari",
                    tint = TokoMuted,
                    modifier = Modifier.size(actionIcon)
                )
            }

            Spacer(Modifier.width(2.dp))

            // Tombol Tema Light
            IconButton(
                onClick = onThemeToggle,
                modifier = Modifier
                    .size(actionSize)
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.surface)
            ) {
                Icon(
                    imageVector = if (isDarkTheme) Icons.Outlined.LightMode else Icons.Outlined.DarkMode,
                    contentDescription = if (isDarkTheme) "Mode terang" else "Mode gelap",
                    tint = TokoMuted,
                    modifier = Modifier.size(actionIcon)
                )
            }
        }
        }

        // Ribbon Status Breadcrumbs Dinamis (Identik index.html & Screenshot)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            breadcrumbs.forEachIndexed { index, crumb ->
                val isLast = index == breadcrumbs.size - 1

                if (index > 0) {
                    Text(
                        text = " › ",
                        color = TokoMuted.copy(alpha = 0.6f),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 2.dp)
                    )
                }

                if (isLast) {
                    // Item aktif sekarang (dengan border box putih rapi)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color.White)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = crumb.label,
                            color = TokoText,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                } else {
                    // Item link sebelumnya (dapat diklik kembali)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .clickable(enabled = crumb.onClick != null) { crumb.onClick?.invoke() }
                            .padding(horizontal = 6.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = crumb.label,
                            color = TokoMuted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
        Spacer(Modifier.height(4.dp))
    }
}
