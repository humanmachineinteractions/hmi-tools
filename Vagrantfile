Vagrant.configure("2") do |config|
  #config.omnibus.chef_version = '11.16'
  #config.berkshelf.enabled = true

  config.vm.box = "precise64"

  config.vm.provider "virtualbox" do |v|
      v.memory = 8000
      v.cpus = 4
      v.customize ["modifyvm", :id, "--cpuexecutioncap", "100"]
      v.gui = true
    end


  #config.ssh.insert_key = true
  #config.ssh.forward_agent = true
  config.ssh.password = "vagrant"

  config.vm.network "private_network", ip: "10.11.12.25"

  # nfs mounted app!
  config.vm.synced_folder "app", "/home/vagrant/app", :nfs => true, id: "app"

  config.vm.synced_folder "deploy", "/home/vagrant/deploy"
  #config.vm.synced_folder "../MITIE", "/home/MITIE"
  config.vm.synced_folder "../currentcms", "/home/currentcms"
  #config.vm.synced_folder "../dfki-spike-data", "/home/dfki-spike-data"
  #config.vm.synced_folder "../test-voice-data", "/home/vagrant/test-voice-data"
  #config.vm.synced_folder "/Users/posttool/Desktop/zoe-readings", "/home/vagrant/zoe-readings"
  #config.vm.synced_folder "/Users/posttool/Desktop/zoe-readings-1", "/home/vagrant/zoe-readings-1"
  config.vm.provision :shell, :path => "deploy/provision.sh"

end

