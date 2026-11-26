import { Module, Global } from '@nestjs/common';

import { SupabaseService } from '../sub_services/supabaseClient';
import { StorageService } from '../sub_services/storage.service';

import { StatsCreatorService } from '../sub_services/stats_creator';

@Global()
@Module({
    providers: [
        SupabaseService,
        StorageService,

        StatsCreatorService,
    ],

    exports: [
        SupabaseService,
        StorageService,

        StatsCreatorService,
    ]
})
export class SupabaseModule {}