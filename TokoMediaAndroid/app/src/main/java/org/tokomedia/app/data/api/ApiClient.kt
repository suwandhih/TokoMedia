package org.tokomedia.app.data.api

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    // URL Live API Client (atau via self-host server)
    // Sesuai rencanakerja.md: https://suwandhih.my.id/index.php/api/ atau live https://tokomedia.org:8009/index.php/api/
    const val BASE_URL = "https://suwandhih.my.id/index.php/api/"
    
    // Token API TokoMedia
    const val API_TOKEN = "AMRmryxyrNf7zDq3u2nL6eQ8WkP109vT5ZbCcH4KsXjGg0VdUiE7Otw34211M90J"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BASIC
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(loggingInterceptor)
        .build()

    val apiService: TokoMediaApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(TokoMediaApiService::class.java)
    }
}
