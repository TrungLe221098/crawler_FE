import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { headerDict } from '../shared/utility';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { User } from '../shared/interface/user';
import { StorageService } from '../shared/services/storage/storage.service';
import { GoogleAuthResponse } from '../shared/interface/google';

const url = environment.api.server;
const requestOptions = {
  headers: new HttpHeaders(headerDict()),
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user$: Observable<User>;
  private readonly userSub = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private storage: StorageService) {
    this.user$ = this.userSub.asObservable();
    // Access Stored User
    this.storage.init().then(() => {
      this.storage.getUser().then((user) => {
        if (user) {
          this.updateUser(user);
        }
      });
    });
  }

  public get user(): User {
    return this.userSub.getValue();
  }

  public token(): string {
    return this.userSub.getValue().accessToken;
  }

  public async signOut() {
    this.userSub.next(null);
    this.storage.removeUser();
  }

  public async signIn(email: string, password: string) {
    try {
      console.log("url: ", url)
      const result = await firstValueFrom(
        this.http.post<User>(
          url + '/api/login',
          {
            email,
            password,
          },
          requestOptions
        )
      );
      console.log("result: ", result)
      await this.updateUser(result);
      return result;
    } catch (error) {
      console.log('err', error);
      return error;
    }
  }

  public async register(fullName: string, email: string, password: string) {
    try {
      const result = await firstValueFrom(
        this.http.post<User>(
          url + '/api/register',
          {
            fullName,
            email,
            password,
          },
          requestOptions
        )
      );
      await this.updateUser(result);
      return result;
    } catch (error) {
      console.log('error', error);
      return error;
    }
  }

  public async googleAuth(payload: GoogleAuthResponse) {
    try {
      const result = await firstValueFrom(
        this.http.post<User>(url + 'auth/google', payload)
      );
      await this.updateUser(result);
      return result;
    } catch (error) {
      console.log('google-auth error:', error);
    }
  }

  private async updateUser(user: User) {
    console.log("user: ", user)
    this.userSub.next(user);
    await this.storage.setUser(user);
  }
}
