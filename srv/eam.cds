using {EAM_SRV as prov} from './external/EAM_SRV.csn';

service eamProvisioning {
    entity roles as projection on prov.ROLESSet;
}