// Simple test to verify that the review section displays uploaded images correctly
// This would be run with Jest or similar testing framework

import { render, screen } from '@testing-library/react';
import CreateStore from '../Components/Store/CreateStore';

// Mock file objects
const createMockFile = (name, type) => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: 1024 });
  return file;
};

describe('CreateStore Review Section', () => {
  test('displays uploaded BIR permit image', () => {
    const mockStoreData = {
      storeName: 'Test Store',
      storeDescription: 'Test Description',
      category: 'Native Handicraft',
      logo: createMockFile('logo.jpg', 'image/jpeg'),
      birPermit: createMockFile('bir.jpg', 'image/jpeg'),
      dtiPermit: createMockFile('dti.pdf', 'application/pdf'),
      idImage: createMockFile('id.jpg', 'image/jpeg'),
      idType: 'UMID',
      tinNumber: '123-456-789-000',
      agreedToTerms: true,
      ownerName: 'Test Owner',
      ownerEmail: 'owner@test.com',
      ownerPhone: '1234567890',
      ownerAddress: 'Test Address'
    };

    // Mock the current step to be 5 (review step)
    jest.spyOn(React, 'useState').mockReturnValue([5, jest.fn()]);

    render(<CreateStore />);
    
    // Check if BIR permit image is displayed
    expect(screen.getByAltText('BIR Permit Preview')).toBeInTheDocument();
    expect(screen.getByText('Document: bir.jpg')).toBeInTheDocument();
  });

  test('displays PDF documents with fallback', () => {
    const mockStoreData = {
      // ... same as above but with PDF files
      dtiPermit: createMockFile('dti.pdf', 'application/pdf'),
    };

    render(<CreateStore />);
    
    // Check if PDF fallback is displayed
    expect(screen.getByText('PDF Document')).toBeInTheDocument();
    expect(screen.getByText('Document: dti.pdf')).toBeInTheDocument();
  });

  test('displays ID document with type information', () => {
    const mockStoreData = {
      // ... same as above
      idImage: createMockFile('id.jpg', 'image/jpeg'),
      idType: 'UMID',
    };

    render(<CreateStore />);
    
    // Check if ID document and type are displayed
    expect(screen.getByAltText('ID Document Preview')).toBeInTheDocument();
    expect(screen.getByText('Type: UMID')).toBeInTheDocument();
  });
});

export default CreateStore;
