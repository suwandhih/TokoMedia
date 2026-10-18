package org.tokomedia.app.ui

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.ContactPhone
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material3.Icon
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import org.tokomedia.app.data.MESSENGER_URL
import org.tokomedia.app.data.Target

data class SideMenuItem(val title: String, val icon: ImageVector, val target: Target)

val SideMenuItems = listOf(
    SideMenuItem("Kitab Suci Alkitab", Icons.AutoMirrored.Filled.MenuBook, Target.Url("https://www.tokomedia.org/app/p/kitab%20suci%20alkitab")),
    SideMenuItem("Film Isa Al-Masih", Icons.Filled.Person, Target.Languages("film-riwayat-isa-al-masih")),
    SideMenuItem("Film Ikatan Ilahi", Icons.Filled.Link, Target.Languages("film-ikatan-ilahi")),
    SideMenuItem("Video Kitab Suci", Icons.Filled.Videocam, Target.Languages("video")),
    SideMenuItem("Clip Kitab Suci", Icons.Filled.PlayArrow, Target.Languages("clip")),
    SideMenuItem("Aplikasi Kitab Suci", Icons.Filled.PhoneAndroid, Target.Languages("app")),
    SideMenuItem("Kontak Kami", Icons.Filled.ContactPhone, Target.Url("https://www.tokomedia.org/contact")),
    SideMenuItem("FB Messenger", Icons.AutoMirrored.Filled.Chat, Target.Url(MESSENGER_URL))
)

@Composable
fun SideMenu(items: List<SideMenuItem>, onItemClick: (SideMenuItem) -> Unit) {
    ModalDrawerSheet(
        drawerContainerColor = TokoSidebar,
        drawerContentColor = Color.White
    ) {
        Spacer(Modifier.height(16.dp))
        items.forEach { item ->
            NavigationDrawerItem(
                label = { Text(item.title) },
                icon = { Icon(item.icon, contentDescription = null) },
                selected = false,
                onClick = { onItemClick(item) },
                colors = NavigationDrawerItemDefaults.colors(
                    unselectedContainerColor = Color.Transparent,
                    unselectedTextColor = Color.White,
                    unselectedIconColor = Color.White
                ),
                modifier = Modifier.padding(NavigationDrawerItemDefaults.ItemPadding)
            )
        }
    }
}
