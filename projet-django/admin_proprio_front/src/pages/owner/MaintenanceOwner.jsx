import React, { useState } from 'react';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Wrench, CheckCircle, Clock, AlertCircle, Upload, Plus, X, Eye } from 'lucide-react';

const MaintenanceOwner = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [requests, setRequests] = useState([
    {
      id: 1,
      property: 'T2 Tokoin',
      tenant: 'Mme Afi',
      issue: 'Fuite d\'eau dans la douche',
      description: 'Fuite importante, nécessite intervention rapide. L\'eau s\'écoule depuis la douche et commence à inonder la salle de bain.',
      priority: 'urgent',
      status: 'pending',
      date: '05/03/2026',
      estimatedCost: 50000,
      images: [],
      beforeImages: ['/api/placeholder/400/300'],
    },
    {
      id: 2,
      property: 'Villa Lomé',
      tenant: 'Mme Sarah',
      issue: 'Climatisation en panne',
      description: 'Climatisation du salon ne fonctionne plus. Elle ne refroidit pas malgré plusieurs essais.',
      priority: 'normal',
      status: 'in_progress',
      date: '03/03/2026',
      estimatedCost: 75000,
      images: ['/api/placeholder/400/300'],
    },
    {
      id: 3,
      property: 'Studio Adidogomé',
      tenant: 'M. Jean',
      issue: 'Problème électrique',
      description: 'Prises ne fonctionnent pas dans la chambre. Impossible d\'utiliser les appareils électriques.',
      priority: 'normal',
      status: 'approved',
      date: '28/02/2026',
      estimatedCost: 35000,
      images: [],
    },
  ]);
  
  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'En attente', icon: Clock, variant: 'warning' };
      case 'in_progress':
        return { label: 'En cours', icon: Wrench, variant: 'info' };
      case 'approved':
        return { label: 'Approuvé', icon: CheckCircle, variant: 'success' };
      case 'completed':
        return { label: 'Terminé', icon: CheckCircle, variant: 'success' };
      default:
        return { label: 'Inconnu', icon: AlertCircle, variant: 'default' };
    }
  };
  
  const getPriorityConfig = (priority) => {
    switch(priority) {
      case 'urgent':
        return { label: 'Urgent', variant: 'error' };
      case 'normal':
        return { label: 'Normal', variant: 'warning' };
      default:
        return { label: 'Normal', variant: 'default' };
    }
  };
  
  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };
  
  const confirmApprove = () => {
    setRequests(requests.map(req => 
      req.id === selectedRequest.id 
        ? { ...req, status: 'approved' }
        : req
    ));
    setShowModal(false);
    setSelectedRequest(null);
  };
  
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inProgressRequests = requests.filter(r => r.status === 'in_progress');
  const completedRequests = requests.filter(r => r.status === 'approved' || r.status === 'completed');
  
  const RequestCard = ({ request }) => {
    const statusConfig = getStatusConfig(request.status);
    const priorityConfig = getPriorityConfig(request.priority);
    const StatusIcon = statusConfig.icon;
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardBody>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-primary">{request.issue}</h3>
              <p className="text-secondary text-sm mt-1">{request.property}</p>
            </div>
            <div className="flex space-x-2">
              <Badge variant={priorityConfig.variant}>
                {priorityConfig.label}
              </Badge>
              <Badge variant={statusConfig.variant}>
                <StatusIcon size={12} className="inline mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>
          
          <p className="text-secondary text-sm mb-3">{request.description.substring(0, 100)}...</p>
          
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-secondary">Locataire</p>
              <p className="font-medium text-primary">{request.tenant}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-secondary">Date</p>
              <p className="font-medium text-primary">{request.date}</p>
            </div>
          </div>
          
          {request.estimatedCost && (
            <div className="mb-4 p-3 bg-brand-50 rounded-xl">
              <p className="text-sm">
                <span className="font-medium">Coût estimé:</span>{' '}
                <span className="text-brand-500 font-bold">{request.estimatedCost.toLocaleString()} CFA</span>
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                setSelectedRequest(request);
                setShowDetailsModal(true);
              }}
            >
              <Eye size={16} className="mr-2" />
              Détails
            </Button>
            
            {request.status === 'pending' && (
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-1"
                onClick={() => handleApprove(request)}
              >
                <CheckCircle size={16} className="mr-2" />
                Approuver
              </Button>
            )}
            
            {request.status === 'in_progress' && (
              <Button 
                variant="primary" 
                size="sm" 
                className="flex-1"
              >
                Suivre
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion de la maintenance</h1>
          <p className="text-secondary mt-2">Suivez et gérez les demandes de réparation</p>
        </div>
        <Button variant="primary">
          <Plus size={20} className="mr-2" />
          Nouvelle demande
        </Button>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-warning">
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">En attente</p>
              <p className="text-2xl font-bold text-warning">{pendingRequests.length}</p>
            </div>
            <Clock size={32} className="text-warning" />
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-brand-500">
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">En cours</p>
              <p className="text-2xl font-bold text-brand-500">{inProgressRequests.length}</p>
            </div>
            <Wrench size={32} className="text-brand-500" />
          </CardBody>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-secondary text-sm">Terminés</p>
              <p className="text-2xl font-bold text-success">{completedRequests.length}</p>
            </div>
            <CheckCircle size={32} className="text-success" />
          </CardBody>
        </Card>
      </div>
      
      {/* En attente */}
      {pendingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
            <Clock size={20} className="mr-2 text-warning" />
            Demandes en attente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
      
      {/* En cours */}
      {inProgressRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
            <Wrench size={20} className="mr-2 text-brand-500" />
            Travaux en cours
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inProgressRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
      
      {/* Historique */}
      {completedRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
            <CheckCircle size={20} className="mr-2 text-success" />
            Historique des interventions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completedRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </div>
      )}
      
      {/* Modal d'approbation */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Approuver la demande de maintenance"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-brand-50 rounded-xl">
              <p className="font-medium">{selectedRequest.property}</p>
              <p className="text-secondary text-sm mt-1">{selectedRequest.issue}</p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-xl">
              <p className="font-medium text-warning">Coût estimé: {selectedRequest.estimatedCost.toLocaleString()} CFA</p>
              <p className="text-sm text-secondary mt-1">
                Ce montant sera déduit des prochains loyers ou vous pourrez rembourser le locataire.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Annuler
              </Button>
              <Button variant="primary" className="flex-1" onClick={confirmApprove}>
                Approuver
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Modal Détails */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails de la demande"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-primary">{selectedRequest.issue}</h3>
                <p className="text-secondary">{selectedRequest.property}</p>
              </div>
              <Badge variant={getPriorityConfig(selectedRequest.priority).variant}>
                {getPriorityConfig(selectedRequest.priority).label}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-secondary">Locataire</p>
                <p className="font-medium">{selectedRequest.tenant}</p>
              </div>
              <div>
                <p className="text-xs text-secondary">Date de signalement</p>
                <p className="font-medium">{selectedRequest.date}</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Description</p>
              <p className="text-secondary">{selectedRequest.description}</p>
            </div>
            
            {selectedRequest.images && selectedRequest.images.length > 0 && (
              <div>
                <p className="font-medium mb-2">Photos</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedRequest.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Photo ${idx + 1}`} className="rounded-xl" />
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Coût estimé</span>
                <span className="text-xl font-bold text-brand-500">
                  {selectedRequest.estimatedCost.toLocaleString()} CFA
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowDetailsModal(false)}>
                Fermer
              </Button>
              {selectedRequest.status === 'pending' && (
                <Button 
                  variant="primary" 
                  className="flex-1" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleApprove(selectedRequest);
                  }}
                >
                  Approuver
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceOwner;