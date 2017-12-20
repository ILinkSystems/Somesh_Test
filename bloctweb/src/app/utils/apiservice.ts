import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class APIService {
  constructor(private http: HttpClient) { }

  private baseUrl = 'http://localhost:3000/api/';
  public isLoggedIn = false;
  public token = '';
  public currentUser: any;
  public devices: any;

  authenticate(body): Promise<any> {
    return this.http.post(this.baseUrl + 'login/authenticate', body)
      .toPromise()
      .then(response => response);
  }

  getDeviceTypes(): Promise<any> {
    return this.http.get(this.baseUrl + 'device/deviceTypes', {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getApiDetails(): Promise<any> {
    return this.http.get(this.baseUrl + 'device/apiDetails', {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getiTraqDevices(): Promise<any> {
    return this.http.get(this.baseUrl + 'device/itraq', {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  addiTraqDevices(isNew, body): Promise<any> {
    return this.http.post(this.baseUrl + 'device/itraq/' + isNew, body, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  getArloDevices(): Promise<any> {
    return this.http.get(this.baseUrl + 'device/arlo', {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }

  addArloDevices(isNew, body): Promise<any> {
    return this.http.post(this.baseUrl + 'device/arlo/' + isNew, body, {
      headers: new HttpHeaders().set('x-access-token', this.token),
    })
      .toPromise()
      .then(response => response);
  }
}
