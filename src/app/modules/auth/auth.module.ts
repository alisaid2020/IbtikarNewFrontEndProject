import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { AuthComponent } from './auth.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [LoginComponent, AuthComponent],
  imports: [SharedModule, AuthRoutingModule, HttpClientModule],
})
export class AuthModule {}
