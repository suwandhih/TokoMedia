package org.tokomedia.app

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import kotlinx.coroutines.launch
import org.tokomedia.app.data.MESSENGER_URL
import org.tokomedia.app.data.Target
import org.tokomedia.app.ui.HomeScreen
import org.tokomedia.app.ui.LanguageScreen
import org.tokomedia.app.ui.SideMenu
import org.tokomedia.app.ui.SideMenuItems
import org.tokomedia.app.ui.TokoTopBar
import org.tokomedia.app.ui.VideoListScreen

private object Routes {
    const val HOME = "home"
    const val LANGUAGES = "languages/{category}"
    const val VIDEOS = "videos/{language}"

    fun languages(category: String) = "languages/$category"
    fun videos(language: String) = "videos/$language"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TokoMediaApp() {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val backStackEntry by navController.currentBackStackEntryAsState()
    val canGoBack = backStackEntry?.destination?.route != Routes.HOME

    fun openUrl(url: String) {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
    }

    fun handleTarget(target: Target) {
        when (target) {
            is Target.Languages -> navController.navigate(Routes.languages(target.category))
            is Target.Videos -> navController.navigate(Routes.videos(target.language))
            is Target.Url -> openUrl(target.url)
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            SideMenu(
                items = SideMenuItems,
                onItemClick = { item ->
                    scope.launch { drawerState.close() }
                    handleTarget(item.target)
                }
            )
        }
    ) {
        Scaffold(
            topBar = {
                TokoTopBar(
                    canGoBack = canGoBack,
                    onMenuClick = { scope.launch { drawerState.open() } },
                    onBackClick = { navController.popBackStack() },
                    onMessengerClick = { openUrl(MESSENGER_URL) }
                )
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = Routes.HOME,
                modifier = Modifier.padding(innerPadding)
            ) {
                composable(Routes.HOME) {
                    HomeScreen(onTargetClick = { handleTarget(it) })
                }
                composable(
                    route = Routes.LANGUAGES,
                    arguments = listOf(navArgument("category") { type = NavType.StringType })
                ) { entry ->
                    val category = entry.arguments?.getString("category").orEmpty()
                    LanguageScreen(
                        categoryId = category,
                        onLanguageClick = { language -> handleTarget(Target.Videos(language.slug)) }
                    )
                }
                composable(
                    route = Routes.VIDEOS,
                    arguments = listOf(navArgument("language") { type = NavType.StringType })
                ) { entry ->
                    VideoListScreen(languageSlug = entry.arguments?.getString("language").orEmpty())
                }
            }
        }
    }
}
