import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { RecipesModule } from './recipes/recipes.module';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { TermsModule } from './terms/terms.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
        CoreModule,
        RecipesModule,
        TermsModule], providers: [
        {
            provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true,
        },
        {
            provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true,
        },
        provideHttpClient(withInterceptorsFromDi())
    ] })
export class AppModule { }
