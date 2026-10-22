package org.tokomedia.app.data.api

import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

interface TokoMediaApiService {

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getCategoryTree(
        @Field("path") path: String = "category/tree"
    ): ApiResponse<List<CategoryDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getLanguagesByRoot(
        @Field("path") path: String = "category/languages",
        @Field("id") rootId: Int
    ): ApiResponse<List<CategoryDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getLatestVideos(
        @Field("path") path: String = "other/latestvideo",
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 20,
        @Field("sort") sort: String = "newest"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getRiwayatVideosBySlug(
        @Field("path") path: String = "riwayat/languagepref",
        @Field("id") slug: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getVkitabVideosBySlug(
        @Field("path") path: String = "vkitab/languagepref",
        @Field("id") slug: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getIkatanVideosBySlug(
        @Field("path") path: String = "ikatan/languagepref",
        @Field("id") slug: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getClipVideos(
        @Field("path") path: String = "ckitab/index",
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getVideoDetail(
        @Field("path") path: String = "other/detailvideo_readonly",
        @Field("id") videoId: Int
    ): ApiResponse<VideoDetailDto>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun sendComment(
        @Field("path") path: String = "other/commentvideo",
        @Field("contactname") name: String,
        @Field("emailaddress") email: String,
        @Field("phonenumber") phone: String,
        @Field("messagecontent") message: String,
        @Field("videoid") videoId: Int,
        @Field("videotitle") videoTitle: String
    ): ApiResponse<Any>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun getAplikasiList(
        @Field("path") path: String = "aplikasi/list",
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("q") query: String? = null
    ): ApiResponse<List<AppDto>>

    @FormUrlEncoded
    @POST("tm-bridge.php")
    suspend fun searchVideos(
        @Field("path") path: String = "search",
        @Field("q") query: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 30
    ): ApiResponse<List<VideoDto>>
}
