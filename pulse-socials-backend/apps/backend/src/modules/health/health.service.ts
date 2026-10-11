import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MonadService } from '../monad/monad.service';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly monadService: MonadService,
    private readonly emailService: EmailService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Basic health check
   */
  async checkHealth() {
    const startTime = Date.now();

    try {
      // Check MongoDB
      const dbStatus =
        this.mongoConnection.readyState === 1 ? 'healthy' : 'unhealthy';

      // Check Monad (simple liveness check)
      let monadStatus = 'healthy';
      try {
        await this.monadService.getPublicClient().getBlockNumber();
      } catch (error) {
        monadStatus = 'unhealthy';
      }

      // Check Email (Brevo primary, Gmail SMTP fallback)
      let emailStatus = 'healthy';
      try {
        if (!this.emailService.getProvider()) {
          emailStatus = 'unhealthy';
        }
      } catch (error) {
        emailStatus = 'unhealthy';
      }

      // Check Upload (Cloudinary)
      let uploadStatus = 'healthy';
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
        if (!cloudName || !uploadPreset) {
          uploadStatus = 'unhealthy';
        }
      } catch (error) {
        uploadStatus = 'unhealthy';
      }

      const responseTime = Date.now() - startTime;
      const isHealthy =
        dbStatus === 'healthy' &&
        monadStatus === 'healthy' &&
        emailStatus === 'healthy' &&
        uploadStatus === 'healthy';

      return {
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        services: {
          database: dbStatus,
          monad: monadStatus,
          email: emailStatus,
          upload: uploadStatus,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  /**
   * Detailed health check with more information
   */
  async checkDetailedHealth() {
    const startTime = Date.now();

    try {
      // MongoDB details
      const dbHealth = {
        status:
          this.mongoConnection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: this.mongoConnection.readyState,
        host: this.mongoConnection.host,
        name: this.mongoConnection.name,
      };

      // Monad details
      const monadHealth: any = {
        status: 'unknown',
        network: this.monadService.getNetwork(),
        chainId: this.monadService.getChainId(),
        explorerUrl: this.monadService.getExplorerUrl(),
      };

      try {
        const blockNumber = await this.monadService
          .getPublicClient()
          .getBlockNumber();
        monadHealth.status = 'connected';
        monadHealth.latestBlock = Number(blockNumber);
      } catch (error) {
        monadHealth.status = 'error';
        monadHealth.error = error.message;
      }

      // Email provider details
      const emailHealth: any = {
        status: 'unknown',
        provider: this.emailService.getProvider() || 'none',
      };

      try {
        const brevoKey = process.env.BREVO_API_KEY;
        const gmailUser = process.env.GMAIL_USER;
        const gmailPass = process.env.GMAIL_APP_PASSWORD;

        if (brevoKey) {
          emailHealth.status = 'configured';
          emailHealth.fromEmail =
            process.env.BREVO_SENDER_EMAIL || 'pulse56@gmail.com';
          emailHealth.senderName = process.env.BREVO_SENDER_NAME || 'Pulse';
          emailHealth.apiKeySet = true;
        } else if (gmailUser && gmailPass) {
          emailHealth.status = 'configured';
          emailHealth.fromEmail =
            process.env.GMAIL_FROM || `Pulse <${gmailUser}>`;
          emailHealth.user = gmailUser;
          emailHealth.apiKeySet = true;
        } else {
          emailHealth.status = 'error';
          emailHealth.error =
            'No provider configured (set BREVO_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD)';
        }
      } catch (error) {
        emailHealth.status = 'error';
        emailHealth.error = error.message;
      }

      // Upload (Cloudinary) details
      const uploadHealth: any = {
        status: 'unknown',
        provider: 'Cloudinary',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      };

      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

        if (cloudName && uploadPreset) {
          uploadHealth.status = 'configured';
          uploadHealth.uploadPreset = uploadPreset;
          uploadHealth.apiUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        } else {
          uploadHealth.status = 'error';
          uploadHealth.error = 'Cloudinary credentials not configured';
        }
      } catch (error) {
        uploadHealth.status = 'error';
        uploadHealth.error = error.message;
      }

      // System info
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: {
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
        },
        cpu: process.cpuUsage(),
      };

      const responseTime = Date.now() - startTime;
      const isHealthy =
        dbHealth.status === 'connected' &&
        monadHealth.status === 'connected' &&
        emailHealth.status === 'configured' &&
        uploadHealth.status === 'configured';

      return {
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: dbHealth,
          monad: monadHealth,
          email: emailHealth,
          upload: uploadHealth,
        },
        system: systemInfo,
      };
    } catch (error) {
      this.logger.error('Detailed health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
