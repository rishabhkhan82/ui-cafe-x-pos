import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService, StaffMember, ShiftSchedule, User } from '../../../services/mock-data.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.css']
})
export class StaffManagementComponent implements OnInit {
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

  // Form data
  staffForm: Partial<StaffMember> = {
    role: 'waiter',
    status: 'active',
    shift: 'morning',
    skills: [],
    emergencyContact: { name: '', phone: '', relationship: '' },
    address: { street: '', city: '', state: '', pincode: '' }
  };

  scheduleForm: Partial<ShiftSchedule> = {
    shift: 'morning',
    startTime: '09:00',
    endTime: '17:00',
    status: 'scheduled'
  };

  constructor(
    private mockDataService: MockDataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;
    });

    this.loadStaff();
    this.loadSchedules();
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
    this.staffForm = {
      role: 'waiter',
      status: 'active',
      shift: 'morning',
      skills: [],
      emergencyContact: { name: '', phone: '', relationship: '' },
      address: { street: '', city: '', state: '', pincode: '' }
    };
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
        avatar: this.staffForm.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
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
    switch (shift) {
      case 'morning': return '09:00';
      case 'afternoon': return '14:00';
      case 'evening': return '18:00';
      case 'night': return '22:00';
      default: return '09:00';
    }
  }

  getShiftEndTime(shift: string): string {
    switch (shift) {
      case 'morning': return '17:00';
      case 'afternoon': return '22:00';
      case 'evening': return '02:00';
      case 'night': return '06:00';
      default: return '17:00';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
      case 'on_leave': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'restaurant_manager': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
      case 'kitchen_manager': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'cashier': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'waiter': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600';
    }
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
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'on_leave': return 'On Leave';
      default: return status;
    }
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
