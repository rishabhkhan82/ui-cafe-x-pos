import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  MockDataService,
  StaffMember,
  ShiftSchedule,
  User,
  StaffFormDefaults,
  ScheduleFormDefaults,
  ShiftTimeConfig,
  BadgeClassConfig,
  DisplayTextConfig,
  SelectOption
} from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.css']
})
export class StaffManagementComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  currentUser: any;
  staffMembers: StaffMember[] = [];
  filteredStaff: StaffMember[] = [];
  selectedStaff: StaffMember | null = null;
  shiftSchedules: ShiftSchedule[] = [];
  searchQuery = '';
  selectedRole = '';
  selectedStatus = '';
  selectedShift = '';
  showStaffModal = false;
  showScheduleModal = false;
  isEditing = false;
  currentDate = new Date();

  // Configuration data from service
  staffFormDefaults: StaffFormDefaults | null = null;
  scheduleFormDefaults: ScheduleFormDefaults | null = null;
  shiftTimeConfigs: ShiftTimeConfig[] = [];
  statusBadgeClasses: BadgeClassConfig[] = [];
  roleBadgeClasses: BadgeClassConfig[] = [];
  statusDisplayTexts: DisplayTextConfig[] = [];
  roleOptions: SelectOption[] = [];
  statusOptions: SelectOption[] = [];
  shiftOptions: SelectOption[] = [];
  scheduleStatusOptions: SelectOption[] = [];
  defaultAvatarUrl = '';

  // Form data
  staffForm: Partial<StaffMember> = {};
  scheduleForm: Partial<ShiftSchedule> = {};

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;
    });

    this.loadConfigurationData();
    this.loadStaff();
    this.loadSchedules();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadConfigurationData(): void {
    // Load staff form defaults
    this.subscriptions.add(
      this.mockDataService.getStaffFormDefaults().subscribe(defaults => {
        this.staffFormDefaults = defaults;
        this.initializeStaffForm();
      })
    );

    // Load schedule form defaults
    this.subscriptions.add(
      this.mockDataService.getScheduleFormDefaults().subscribe(defaults => {
        this.scheduleFormDefaults = defaults;
        this.initializeScheduleForm();
      })
    );

    // Load shift time configurations
    this.subscriptions.add(
      this.mockDataService.getShiftTimeConfigs().subscribe(configs => {
        this.shiftTimeConfigs = configs;
      })
    );

    // Load badge class configurations
    this.subscriptions.add(
      this.mockDataService.getStatusBadgeClasses().subscribe(classes => {
        this.statusBadgeClasses = classes;
      })
    );

    this.subscriptions.add(
      this.mockDataService.getRoleBadgeClasses().subscribe(classes => {
        this.roleBadgeClasses = classes;
      })
    );

    // Load display text configurations
    this.subscriptions.add(
      this.mockDataService.getStatusDisplayTexts().subscribe(texts => {
        this.statusDisplayTexts = texts;
      })
    );

    // Load select options
    this.subscriptions.add(
      this.mockDataService.getRoleOptions().subscribe(options => {
        this.roleOptions = options;
      })
    );

    this.subscriptions.add(
      this.mockDataService.getStatusOptions().subscribe(options => {
        this.statusOptions = options;
      })
    );

    this.subscriptions.add(
      this.mockDataService.getShiftOptions().subscribe(options => {
        this.shiftOptions = options;
      })
    );

    this.subscriptions.add(
      this.mockDataService.getScheduleStatusOptions().subscribe(options => {
        this.scheduleStatusOptions = options;
      })
    );

    // Load default avatar URL
    this.subscriptions.add(
      this.mockDataService.getDefaultAvatarUrl().subscribe(url => {
        this.defaultAvatarUrl = url;
      })
    );
  }

  initializeStaffForm(): void {
    if (this.staffFormDefaults) {
      this.staffForm = { ...this.staffFormDefaults };
    }
  }

  initializeScheduleForm(): void {
    if (this.scheduleFormDefaults) {
      this.scheduleForm = { ...this.scheduleFormDefaults };
    }
  }

  loadStaff(): void {
    this.mockDataService.getStaff().subscribe(staff => {
      this.staffMembers = staff;
      this.filterStaff();
    });
  }

  loadSchedules(): void {
    this.mockDataService.getShiftSchedules().subscribe(schedules => {
      this.shiftSchedules = schedules;
    });
  }

  filterStaff(): void {
    this.filteredStaff = this.staffMembers.filter(staff => {
      const matchesSearch = !this.searchQuery ||
        staff.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesRole = !this.selectedRole || staff.role === this.selectedRole;
      const matchesStatus = !this.selectedStatus || staff.status === this.selectedStatus;
      const matchesShift = !this.selectedShift || staff.shift === this.selectedShift;

      return matchesSearch && matchesRole && matchesStatus && matchesShift;
    });
  }

  addNewStaff(): void {
    this.isEditing = false;
    this.initializeStaffForm();
    this.showStaffModal = true;
  }

  editStaff(staff: StaffMember): void {
    this.isEditing = true;
    this.staffForm = { ...staff };
    this.showStaffModal = true;
  }

  saveStaff(): void {
    if (this.isEditing && this.staffForm.id) {
      // Update existing staff
      const updatedStaff = this.staffMembers.map(staff =>
        staff.id === this.staffForm.id ? { ...staff, ...this.staffForm } : staff
      );
      this.staffMembers = updatedStaff;
    } else {
      // Add new staff
      const newStaff: StaffMember = {
        id: `staff-${Date.now()}`,
        name: this.staffForm.name || '',
        email: this.staffForm.email || '',
        phone: this.staffForm.phone || '',
        role: this.staffForm.role || 'waiter',
        avatar: this.staffForm.avatar || this.defaultAvatarUrl,
        restaurantId: this.currentUser?.restaurantId || '',
        hireDate: new Date(),
        salary: this.staffForm.salary || 0,
        status: this.staffForm.status || 'active',
        shift: this.staffForm.shift || 'morning',
        skills: this.staffForm.skills || [],
        performanceRating: 0,
        emergencyContact: this.staffForm.emergencyContact || { name: '', phone: '', relationship: '' },
        address: this.staffForm.address || { street: '', city: '', state: '', pincode: '' }
      };
      this.staffMembers.push(newStaff);
    }
    this.filterStaff();
    this.closeStaffModal();
  }

  deleteStaff(staff: StaffMember): void {
    if (confirm(`Are you sure you want to delete ${staff.name}?`)) {
      this.staffMembers = this.staffMembers.filter(s => s.id !== staff.id);
      this.filterStaff();
    }
  }

  scheduleShift(staff: StaffMember): void {
    this.scheduleForm = {
      staffId: staff.id,
      staffName: staff.name,
      date: new Date(),
      shift: staff.shift,
      startTime: this.getShiftStartTime(staff.shift),
      endTime: this.getShiftEndTime(staff.shift),
      status: 'scheduled'
    };
    this.showScheduleModal = true;
  }

  saveSchedule(): void {
    const newSchedule: ShiftSchedule = {
      id: `shift-${Date.now()}`,
      staffId: this.scheduleForm.staffId || '',
      staffName: this.scheduleForm.staffName || '',
      date: this.scheduleForm.date || new Date(),
      shift: this.scheduleForm.shift || 'morning',
      startTime: this.scheduleForm.startTime || '09:00',
      endTime: this.scheduleForm.endTime || '17:00',
      status: this.scheduleForm.status || 'scheduled'
    };
    this.shiftSchedules.push(newSchedule);
    this.closeScheduleModal();
  }

  getShiftStartTime(shift: string): string {
    return this.mockDataService.getShiftStartTime(shift as StaffMember['shift']);
  }

  getShiftEndTime(shift: string): string {
    return this.mockDataService.getShiftEndTime(shift as StaffMember['shift']);
  }

  getStatusBadgeClass(status: string): string {
    return this.mockDataService.getStatusBadgeClass(status as StaffMember['status']);
  }

  getRoleBadgeClass(role: string): string {
    return this.mockDataService.getRoleBadgeClass(role as StaffMember['role']);
  }

  closeStaffModal(): void {
    this.showStaffModal = false;
  }

  closeScheduleModal(): void {
    this.showScheduleModal = false;
  }

  onStaffChange(): void {
    const selectedStaff = this.staffMembers.find(s => s.id === this.scheduleForm.staffId);
    if (selectedStaff) {
      this.scheduleForm.staffName = selectedStaff.name;
      this.scheduleForm.shift = selectedStaff.shift;
      this.scheduleForm.startTime = this.getShiftStartTime(selectedStaff.shift);
      this.scheduleForm.endTime = this.getShiftEndTime(selectedStaff.shift);
    }
  }

  onShiftChange(): void {
    this.scheduleForm.startTime = this.getShiftStartTime(this.scheduleForm.shift || 'morning');
    this.scheduleForm.endTime = this.getShiftEndTime(this.scheduleForm.shift || 'morning');
  }

  getAverageRating(): string {
    if (this.staffMembers.length === 0) return '0.0';
    const total = this.staffMembers.reduce((sum, staff) => sum + staff.performanceRating, 0);
    return (total / this.staffMembers.length).toFixed(1);
  }

  getActiveStaffCount(): number {
    return this.staffMembers.filter(s => s.status === 'active').length;
  }

  getTodaysSchedulesCount(): number {
    return this.shiftSchedules.filter(s => s.date.toDateString() === this.currentDate.toDateString()).length;
  }

  // New methods for the redesigned component
  selectStaff(staff: StaffMember): void {
    this.selectedStaff = staff;
  }

  getStatusDisplayText(status: string): string {
    return this.mockDataService.getStatusDisplayText(status as StaffMember['status']);
  }

  viewPerformance(): void {
    alert('Opening staff performance analytics...');
  }

  exportStaffData(): void {
    alert('Exporting staff data to CSV...');
  }

  manageAttendance(): void {
    alert('Opening attendance management interface...');
  }

  toggleTheme(): void {
    // Theme toggle logic would go here
  }
}
