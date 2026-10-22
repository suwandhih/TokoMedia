package org.tokomedia.app.data.api

import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded
import retrofit2.http.POST

interface TokoMediaApiService {

    @FormUrlEncoded
    @POST("category/tree")
    suspend fun getCategoryTree(
        @Field("token") token: String
    ): ApiResponse<List<CategoryDto>>

    @FormUrlEncoded
    @POST("category/languages")
    suspend fun getLanguagesByRoot(
        @Field("token") token: String,
        @Field("id") rootId: Int
    ): ApiResponse<List<CategoryDto>>

    @FormUrlEncoded
    @POST("other/latestvideo")
    suspend fun getLatestVideos(
        @Field("token") token: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 20,
        @Field("sort") sort: String = "newest"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("riwayat/languagepref")
    suspend fun getRiwayatVideosBySlug(
        @Field("token") token: String,
        @Field("id") slug: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("vkitab/languagepref")
    suspend fun getVkitabVideosBySlug(
        @Field("token") token: String,
        @Field("id") slug: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("ikatan/languagepref")
    suspend fun getIkatanVideosBySlug(
        @Field("token") token: String,
        @Field("id") slug: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("ckitab/index")
    suspend fun getClipVideos(
        @Field("token") token: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("sort") sort: String = "trending"
    ): ApiResponse<List<VideoDto>>

    @FormUrlEncoded
    @POST("other/detailvideo_readonly")
    suspend fun getVideoDetail(
        @Field("token") token: String,
        @Field("id") videoId: Int
    ): ApiResponse<VideoDetailDto>

    @FormUrlEncoded
    @POST("aplikasi/list")
    suspend fun getAplikasiList(
        @Field("token") token: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 50,
        @Field("q") query: String? = null
    ): ApiResponse<List<AppDto>>

    @FormUrlEncoded
    @POST("search")
    suspend fun searchVideos(
        @Field("token") token: String,
        @Field("q") query: String,
        @Field("page") page: Int = 1,
        @Field("per_page") perPage: Int = 30
    ): ApiResponse<List<VideoDto>>
}
