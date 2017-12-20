import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from '@angular/router';
import { APIService } from '../utils/apiservice';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
    constructor(private apiService: APIService, private router: Router, private domSanitizer: DomSanitizer) { }

    private currentUser: any;
    private deviceTypes: any;
    private selectedDeviceType: any;
    private deviceName: string;
    private username: string;
    private password: string;
    private apiKey = '';
    private lat = 51.673858;
    private lng = 7.815982;
    private showPopup = false;
    private selectedIdx: number;
    private oldIndex = -1;
    private showMap = false;
    private showIframe = false;
    private arloSiteUrl;

    ngOnInit(): void {
        this.apiService.devices = [];
        if (!this.apiService.isLoggedIn) {
            this.router.navigate(['/login']);
        }
        this.arloSiteUrl = this.domSanitizer.bypassSecurityTrustResourceUrl('https://arlo.netgear.com/');
        this.currentUser = this.apiService.currentUser;
        if (this.apiService.token !== '') {
            this.apiService.getDeviceTypes().then(data => {
                if (data.success) {
                    this.deviceTypes = data.deviceTypes;
                    this.selectedDeviceType = this.deviceTypes[0];
                }
            });
            this.apiService.getApiDetails().then(data => {
                this.getiTraqDevice(data.apiDetails);
                this.getArloDevice(data.apiDetails);
            });
        }
    }

    getiTraqDevice(apiDetails) {
        if (this.apiService.token !== '') {
            this.apiService.getiTraqDevices().then(data => {
                if (data.success) {
                    if (data.itraqDevice !== null) {
                        this.apiService.devices.push(data.itraqDevice);
                    }
                }
            });
        }
    }

    getArloDevice(apiDetails) {
        if (this.apiService.token !== '') {
            this.apiService.getArloDevices().then(data => {
                if (data.success) {
                    if (data.arloDevice !== null) {
                        this.apiService.devices.push(data.arloDevice);
                    }
                }
            });
        }
    }

    addDevice() {
        this.clearFormData();
        this.showPopup = true;
    }

    saveNewDevice() {
        const body = {
            selectedDeviceType: this.selectedDeviceType,
            deviceName: this.deviceName,
            username: this.username,
            password: this.password,
            apiKey: this.apiKey
        };
        switch (this.selectedDeviceType.id) {
            case 1:
                this.apiService.addiTraqDevices(true, body).then(data => {
                    if (data.success) {
                        this.apiService.devices.push(data.itraqDevice);
                    }
                });
                break;
            case 3:
                this.apiService.addArloDevices(true, body).then(data => {
                    if (data.success) {
                        this.apiService.devices.push(data.arloDevice);
                    }
                });
                break;
        }
        this.showPopup = false;
        this.clearFormData();
    }

    clearFormData() {
        this.deviceName = '';
        this.username = '';
        this.password = '';
        this.selectedDeviceType = this.deviceTypes[0];
    }

    selectDevice(index, selectedDevice) {
        if (this.oldIndex === index) {
            this.selectedIdx = -1;
            this.oldIndex = -1;
        } else {
            this.selectedIdx = index;
            this.oldIndex = index;
        }
        this.showMap = selectedDevice.deviceTypeId !== 3;
        this.showIframe = selectedDevice.deviceTypeId === 3;
        this.lat = selectedDevice.location.lat;
        this.lng = selectedDevice.location.lon;
    }

    onLocateOnMap(device) {
        this.lat = device.location.lat;
        this.lng = device.location.lon;
    }

    onViewDetails(device) {
    }

    onViewBlockChain(device) {
    }

    logout() {
        this.apiService.isLoggedIn = false;
        this.router.navigate(['/login']);
    }
}
