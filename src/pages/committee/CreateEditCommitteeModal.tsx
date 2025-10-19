import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from '@nextui-org/react';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import type { Committee } from '../../types/committee';

interface CreateEditCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (committee: Committee) => void;
  committee?: Committee | null;
  mode: 'create' | 'edit';
}

const CreateEditCommitteeModal: React.FC<CreateEditCommitteeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  committee,
  mode
}) => {
  console.log('Modal props:', { isOpen, mode, committee }); // Debug log
  const [formData, setFormData] = useState<Committee>({
    name: committee?.name || '',
    description: committee?.description || '',
    totalAmount: committee?.totalAmount || '',
    monthlyAmount: committee?.monthlyAmount || '',
    duration: committee?.duration || '',
    startDate: committee?.startDate || '',
    location: committee?.location || '',
    maxMembers: committee?.maxMembers || 10,
    category: committee?.category || '',
    rules: committee?.rules || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { label: 'Savings Committee', value: 'savings' },
    { label: 'Investment Committee', value: 'investment' },
    { label: 'Emergency Fund', value: 'emergency' },
    { label: 'Travel Fund', value: 'travel' },
    { label: 'Business Committee', value: 'business' },
    { label: 'Education Fund', value: 'education' },
    { label: 'Other', value: 'other' }
  ];

  const durations = [
    { label: '6 Months', value: '6' },
    { label: '12 Months', value: '12' },
    { label: '15 Months', value: '15' },
    { label: '18 Months', value: '18' },
    { label: '24 Months', value: '24' },
    { label: '36 Months', value: '36' }
  ];

  const handleInputChange = (field: keyof Committee, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Committee name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.totalAmount.trim()) newErrors.totalAmount = 'Total amount is required';
    if (!formData.monthlyAmount.trim()) newErrors.monthlyAmount = 'Monthly amount is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (formData.maxMembers < 2) newErrors.maxMembers = 'Minimum 2 members required';

    // Validate amounts are positive numbers
    if (formData.totalAmount && isNaN(Number(formData.totalAmount))) {
      newErrors.totalAmount = 'Please enter a valid amount';
    }
    if (formData.monthlyAmount && isNaN(Number(formData.monthlyAmount))) {
      newErrors.monthlyAmount = 'Please enter a valid amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        id: committee?.id || Date.now().toString()
      });
      handleClose();
    } catch (error) {
      console.error('Failed to save committee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      totalAmount: '',
      monthlyAmount: '',
      duration: '',
      startDate: '',
      location: '',
      maxMembers: 10,
      category: '',
      rules: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-gray-900 border border-gray-700 max-h-[85vh] w-full max-w-2xl mx-4",
        header: "border-b border-gray-700 py-3",
        body: "py-3 max-h-[60vh] overflow-y-auto",
        footer: "border-t border-gray-700 py-3"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white">
            {mode === 'create' ? 'Create New Committee' : 'Edit Committee'}
          </h2>
          <p className="text-gray-400 text-sm">
            {mode === 'create' 
              ? 'Fill in the details to create a new committee' 
              : 'Update the committee information'
            }
          </p>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-3">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Input
                    label="Committee Name"
                    placeholder="Enter committee name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                    size="sm"
                    classNames={{
                      base: "max-w-full",
                      mainWrapper: "h-full",
                      input: "text-white",
                      inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                    }}
                  />
                </div>
                
                <div>
                  <Select
                    label="Category"
                    placeholder="Select category"
                    selectedKeys={formData.category ? [formData.category] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      handleInputChange('category', value);
                    }}
                    isInvalid={!!errors.category}
                    errorMessage={errors.category}
                    size="sm"
                    classNames={{
                      trigger: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border-gray-600"
                    }}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Textarea
                  label="Description"
                  placeholder="Describe the purpose and goals of this committee"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description}
                  minRows={2}
                  size="sm"
                  classNames={{
                    base: "max-w-full",
                    input: "text-white",
                    inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                  }}
                />
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Financial Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Input
                    label="Total Amount"
                    placeholder="100000"
                    value={formData.totalAmount}
                    onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                    isInvalid={!!errors.totalAmount}
                    errorMessage={errors.totalAmount}
                    size="sm"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-gray-400 text-small">₹</span>
                      </div>
                    }
                    classNames={{
                      base: "max-w-full",
                      input: "text-white",
                      inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                    }}
                  />
                </div>
                
                <div>
                  <Input
                    label="Monthly Amount"
                    placeholder="7000"
                    value={formData.monthlyAmount}
                    onChange={(e) => handleInputChange('monthlyAmount', e.target.value)}
                    isInvalid={!!errors.monthlyAmount}
                    errorMessage={errors.monthlyAmount}
                    size="sm"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-gray-400 text-small">₹</span>
                      </div>
                    }
                    classNames={{
                      base: "max-w-full",
                      input: "text-white",
                      inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                    }}
                  />
                </div>
                
                <div>
                  <Select
                    label="Duration"
                    placeholder="Select duration"
                    selectedKeys={formData.duration ? [formData.duration] : []}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      handleInputChange('duration', value);
                    }}
                    isInvalid={!!errors.duration}
                    errorMessage={errors.duration}
                    size="sm"
                    classNames={{
                      trigger: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750",
                      value: "text-white",
                      popoverContent: "bg-gray-800 border-gray-600"
                    }}
                  >
                    {durations.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Schedule & Location */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule & Location
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    isInvalid={!!errors.startDate}
                    errorMessage={errors.startDate}
                    size="sm"
                    classNames={{
                      base: "max-w-full",
                      input: "text-white",
                      inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                    }}
                  />
                </div>
                
                <div>
                  <Input
                    label="Location"
                    placeholder="Mumbai, Delhi, etc."
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    isInvalid={!!errors.location}
                    errorMessage={errors.location}
                    size="sm"
                    startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                    classNames={{
                      base: "max-w-full",
                      input: "text-white",
                      inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                    }}
                  />
                </div>
                
                <div>
                  <Input
                    type="number"
                    label="Max Members"
                    placeholder="10"
                    value={formData.maxMembers.toString()}
                    onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value) || 0)}
                    isInvalid={!!errors.maxMembers}
                    errorMessage={errors.maxMembers}
                    min={2}
                    max={100}
                    size="sm"
                    classNames={{
                      base: "max-w-full",
                      input: "text-white",
                      inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Rules & Guidelines */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Rules & Guidelines</h3>
              
              <div>
                <Textarea
                  label="Committee Rules (Optional)"
                  placeholder="Enter any specific rules or guidelines for this committee..."
                  value={formData.rules}
                  onChange={(e) => handleInputChange('rules', e.target.value)}
                  minRows={2}
                  size="sm"
                  classNames={{
                    base: "max-w-full",
                    input: "text-white",
                    inputWrapper: "bg-gray-800 border-gray-600 data-[hover=true]:bg-gray-750"
                  }}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            color="danger" 
            variant="light" 
            onPress={handleClose}
            className="text-gray-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onPress={handleSave}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Committee' : 'Update Committee')
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateEditCommitteeModal;