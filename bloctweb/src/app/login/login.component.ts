import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../utils/apiservice';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    constructor(private apiService: APIService, private router: Router) { }

    private userName: string;
    private password: string;
    private result: string;

    @Output() onSignUp = new EventEmitter<boolean>();

    loginClicked(): void {
        if (this.userName !== '' && this.password !== '') {
        const body = { username: this.userName, password: this.password };
        this.apiService.authenticate(body)
            .then(data => {
                if (data.success) {
                    this.apiService.isLoggedIn = true;
                    this.apiService.token = data.token;
                    this.apiService.currentUser = data.user;
                    this.result = data.token;
                    this.router.navigate(['/dashboard']);
                } else {
                    this.result = data.message;
                }
            });
        } else {
            this.result = 'Please provide Username and Password';
        }
    }

    signupClicked(): void {
        this.router.navigate(['/signup']);
    }
}
