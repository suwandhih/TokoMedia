package org.tokomedia.app.data.repository

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.tokomedia.app.data.api.ApiClient
import org.tokomedia.app.data.api.CategoryDto
import org.tokomedia.app.data.api.VideoDetailDto
import org.tokomedia.app.data.api.VideoDto

class TokoMediaRepository {

    private val api = ApiClient.apiService

    suspend fun getCategoryTree(): Result<List<CategoryDto>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getCategoryTree()
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat kategori"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getLatestVideos(): Result<List<VideoDto>> = withContext(Dispatchers.IO) {
        try {
            val response = api.getLatestVideos(page = 1, perPage = 20)
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat video terbaru"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getVideosByCategory(categorySlug: String, languageSlug: String): Result<List<VideoDto>> = withContext(Dispatchers.IO) {
        try {
            val response = when (categorySlug) {
                "film-riwayat-isa-al-masih" -> api.getRiwayatVideosBySlug(slug = languageSlug)
                "video", "film-kitab-suci-injil" -> api.getVkitabVideosBySlug(slug = languageSlug)
                "film-ikatan-ilahi" -> api.getIkatanVideosBySlug(slug = languageSlug)
                "clip" -> api.getClipVideos()
                else -> api.getRiwayatVideosBySlug(slug = languageSlug)
            }
            if (response.status == 200 && response.data != null) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Gagal memuat video"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getVideoDetail(videoId: Int): Result<VideoDetailDto?> = withContext(Dispatchers.IO) {
        try {
            val response = api.getVideoDetail(videoId = videoId)
            if (response.status == 200) {
                Result.success(response.data)
            } else {
                Result.failure(Exception(response.message ?: "Video tidak ditemukan"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun likeVideo(videoId: Int): Result<Long> = withContext(Dispatchers.IO) {
        try {
            val response = api.likeVideo(videoId = videoId)
            if (response.status == 200) {
                Result.success(response.data?.totallike ?: 0)
            } else {
                Result.failure(Exception(response.message ?: "Gagal menyukai video"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendComment(
        name: String,
        email: String,
        phone: String,
        message: String,
        videoId: Int,
        videoTitle: String
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val response = api.sendComment(
                name = name,
                email = email,
                phone = phone,
                message = message,
                videoId = videoId,
                videoTitle = videoTitle
            )
            if (response.status == 200) {
                Result.success(response.message ?: "Terima kasih telah meninggalkan komentar")
            } else {
                Result.failure(Exception(response.message ?: "Gagal mengirim tanggapan"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
