import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  
  const currentSessionID = inject(AuthService).session

  if(currentSessionID == route.url[1].path){
    return true
  } else {
    inject(Router).navigateByUrl('/');
    return false
  }
  
};
