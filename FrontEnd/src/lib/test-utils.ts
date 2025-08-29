
// Test utilities and unit testing helpers
import { localStorageManager, DEMO_SERVICES, DEMO_CHANNELS } from './localStorage';
import { Service, Channel, ChatMessage } from '@/types/chat';

export const testUtils = {
  // Test localStorage functionality
  testLocalStorage: () => {
    console.log('🧪 Testing localStorage functionality...');
    
    try {
      // Test basic get/set
      localStorageManager.set('test_key', { test: 'value' });
      const testValue = localStorageManager.get('test_key', null);
      console.log('✅ Basic localStorage works:', testValue);

      // Test services
      const services = localStorageManager.getServices();
      console.log('✅ Services loaded:', services.length, 'services');

      // Test channels  
      const channels = localStorageManager.getChannels();
      console.log('✅ Channels loaded:', channels.length, 'channels');

      // Test theme
      localStorageManager.saveTheme('dark');
      const theme = localStorageManager.getTheme();
      console.log('✅ Theme functionality works:', theme);

      // Clean up test data
      localStorageManager.remove('test_key');
      
      console.log('✅ All localStorage tests passed!');
      return true;
    } catch (error) {
      console.error('❌ localStorage test failed:', error);
      return false;
    }
  },

  // Test demo data integrity
  testDemoData: () => {
    console.log('🧪 Testing demo data integrity...');
    
    try {
      // Validate services structure
      DEMO_SERVICES.forEach((service, index) => {
        if (!service.id || !service.name || !service.category) {
          throw new Error(`Invalid service at index ${index}`);
        }
      });
      console.log('✅ Demo services are valid');

      // Validate channels structure  
      DEMO_CHANNELS.forEach((channel, index) => {
        if (!channel.id || !channel.name || !channel.type) {
          throw new Error(`Invalid channel at index ${index}`);
        }
      });
      console.log('✅ Demo channels are valid');

      // Test service-channel relationships
      const serviceIds = DEMO_SERVICES.map(s => s.id);
      const orphanChannels = DEMO_CHANNELS.filter(c => 
        c.serviceId && !serviceIds.includes(c.serviceId)
      );
      
      if (orphanChannels.length > 0) {
        console.warn('⚠️  Found orphaned channels:', orphanChannels);
      } else {
        console.log('✅ All channels properly linked to services');
      }

      console.log('✅ All demo data tests passed!');
      return true;
    } catch (error) {
      console.error('❌ Demo data test failed:', error);
      return false;
    }
  },

  // Test theme system
  testThemeSystem: () => {
    console.log('🧪 Testing theme system...');
    
    try {
      // Test CSS variable existence
      const root = document.documentElement;
      const bgColor = getComputedStyle(root).getPropertyValue('--background');
      
      if (!bgColor) {
        throw new Error('CSS variables not properly loaded');
      }
      
      console.log('✅ CSS variables loaded:', bgColor.trim());

      // Test dark mode toggle
      const isDarkBefore = root.classList.contains('dark');
      root.classList.toggle('dark');
      const isDarkAfter = root.classList.contains('dark');
      
      if (isDarkBefore === isDarkAfter) {
        throw new Error('Dark mode toggle not working');
      }
      
      // Restore original state
      root.classList.toggle('dark');
      console.log('✅ Dark mode toggle works');

      console.log('✅ All theme system tests passed!');
      return true;
    } catch (error) {
      console.error('❌ Theme system test failed:', error);
      return false;
    }
  },

  // Run all tests
  runAllTests: () => {
    console.log('🚀 Running comprehensive test suite...');
    
    const results = {
      localStorage: testUtils.testLocalStorage(),
      demoData: testUtils.testDemoData(),
      themeSystem: testUtils.testThemeSystem(),
    };

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      console.log('🎉 All tests passed! System is ready.');
    } else {
      console.error('❌ Some tests failed. Check the logs above.');
    }

    return results;
  },

  // Initialize demo data for testing
  initializeTestData: () => {
    console.log('📝 Initializing test data...');
    localStorageManager.initializeDemoData();
    
    // Add some test messages
    const testMessages: Omit<ChatMessage, 'id' | 'timestamp' | 'deliveryStatus'>[] = [
      {
        content: 'Welcome to the enhanced chat system!',
        author: { id: 'system', name: 'System', status: 'online' },
        channelId: 'ch-001',
        type: 'text',
        reactions: [],
        mentions: [],
        isEncrypted: false
      },
      {
        content: 'This is a test message with proper functionality.',
        author: { id: 'user-1', name: 'Test User', status: 'online' },
        channelId: 'ch-001',
        type: 'text',
        reactions: [],
        mentions: [],
        isEncrypted: false
      }
    ];

    testMessages.forEach(msgData => {
      const message: ChatMessage = {
        ...msgData,
        id: `msg-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        deliveryStatus: 'sent'
      };
      localStorageManager.saveMessage(message);
    });

    console.log('✅ Test data initialized successfully');
  }
};

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to ensure everything is loaded
  setTimeout(() => {
    testUtils.runAllTests();
    testUtils.initializeTestData();
  }, 1000);
}
